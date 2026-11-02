import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '', 
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Transaction {
  id: string;
  created_at: string;
  transaction_date: string;
  type: 'masuk' | 'keluar';
  amount: number;
  category: string;
  contributor_name: string | null;
  description: string | null;
  proof_url: string;
  status: string;
}

export default function AdminApprovalPanel({ onLogout }: { onLogout: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'approval' | 'expense' | 'manage'>('approval');
  const [pendingList, setPendingList] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State untuk Input Pengeluaran oleh Bendahara
  const [expAmount, setExpAmount] = useState<string>('');
  const [expDesc, setExpDesc] = useState<string>('');
  const [expCategory, setExpCategory] = useState<string>('Operasional Desa');
  const [expDate, setExpDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expFile, setExpFile] = useState<File | null>(null);
  const [expLoading, setExpLoading] = useState<boolean>(false);
  const [expError, setExpError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data:', error.message);
    } else {
      const rows = data || [];
      setPendingList(rows.filter(r => r.type === 'masuk' && r.status === 'pending'));
      setAllTransactions(rows);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Setujui Setoran Warga
  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) alert(`Gagal menyetujui: ${error.message}`);
    else fetchData();
  };

  // Tolak / Hapus Setoran Pending
  const handleReject = async (id: string) => {
    if (!window.confirm('Tolak dan hapus setoran ini?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) alert(`Gagal menghapus: ${error.message}`);
    else fetchData();
  };

  // Hapus Transaksi Sah / Keluar
  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('PERINGATAN: Hapus catatan transaksi ini dari sistem?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) alert(`Gagal menghapus: ${error.message}`);
    else fetchData();
  };

  // Submit Pengeluaran Kas oleh Bendahara
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpError(null);

    if (!expAmount || Number(expAmount) <= 0) {
      setExpError('Masukkan nominal pengeluaran dengan benar.');
      return;
    }
    if (!expDesc.trim()) {
      setExpError('Deskripsi/keperluan pengeluaran wajib diisi.');
      return;
    }
    if (!expFile) {
      setExpFile(null); // Izinkan opsional atau wajibkan nota
      setExpError('Wajib melampirkan foto nota/kuitansi pengeluaran.');
      return;
    }

    setExpLoading(true);
    try {
      const fileExt = expFile.name.split('.').pop();
      const fileName = `exp-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, expFile);

      if (uploadError) throw new Error(`Gagal upload nota: ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      const payload = {
        type: 'keluar',
        amount: Number(expAmount),
        category: expCategory,
        contributor_name: null,
        description: expDesc,
        transaction_date: expDate,
        proof_url: publicUrlData.publicUrl,
        status: 'approved', // Langsung approved karena diinput bendahara
      };

      const { error: dbError } = await supabase.from('transactions').insert([payload]);
      if (dbError) throw new Error(`Gagal mencatat pengeluaran: ${dbError.message}`);

      alert('Pengeluaran kas berhasil dicatat dan saldo otomatis terpotong.');
      setExpAmount('');
      setExpDesc('');
      setExpFile(null);
      setActiveSubTab('manage');
      fetchData();
    } catch (err: any) {
      setExpError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setExpLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Memuat panel admin...</div>;

  return (
    <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Panel Kontrol Bendahara</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Validasi iuran warga, input belanja kas, dan manajemen riwayat keuangan.</p>
        </div>
        <button 
          onClick={onLogout}
          style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#334155' }}
        >
          Keluar Sesi Admin
        </button>
      </div>

      {/* Sub-Tab Navigasi Admin */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveSubTab('approval')}
          style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', background: activeSubTab === 'approval' ? '#2563eb' : '#f1f5f9', color: activeSubTab === 'approval' ? '#fff' : '#475569' }}
        >
          Verifikasi Setoran ({pendingList.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('expense')}
          style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', background: activeSubTab === 'expense' ? '#2563eb' : '#f1f5f9', color: activeSubTab === 'expense' ? '#fff' : '#475569' }}
        >
          + Catat Pengeluaran Kas
        </button>
        <button 
          onClick={() => setActiveSubTab('manage')}
          style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', background: activeSubTab === 'manage' ? '#2563eb' : '#f1f5f9', color: activeSubTab === 'manage' ? '#fff' : '#475569' }}
        >
          Kelola / Hapus Riwayat ({allTransactions.length})
        </button>
      </div>

      {/* 1. KONTEN SUB-TAB: APPROVAL PENDING */}
      {activeSubTab === 'approval' && (
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#1e293b' }}>Antrean Setoran Masuk (Pending)</h4>
          {pendingList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
              Tidak ada setoran warga yang menunggu verifikasi saat ini.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingList.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', background: '#f8fafc', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748b' }}>Tanggal: {item.transaction_date}</p>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>{item.contributor_name}</p>
                    <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#16a34a' }}>Rp {item.amount.toLocaleString('id-ID')}</p>
                    <a href={item.proof_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                      🔍 Lihat Bukti Transfer M-Banking ↗
                    </a>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleApprove(item.id)}
                      style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Setujui
                    </button>
                    <button 
                      onClick={() => handleReject(item.id)}
                      style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. KONTEN SUB-TAB: CATAT PENGELUARAN */}
      {activeSubTab === 'expense' && (
        <div style={{ maxWidth: '600px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#1e293b' }}>Form Pencatatan Pengeluaran Kas</h4>
          
          {expError && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fecaca' }}>{expError}</div>}

          <form onSubmit={handleExpenseSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>Kategori Pengeluaran:</label>
              <select 
                value={expCategory} 
                onChange={(e) => setExpCategory(e.target.value)} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px' }}
              >
                <option value="Operasional Desa">Operasional Desa / RT</option>
                <option value="Infrastruktur & Pembangunan">Infrastruktur & Pembangunan</option>
                <option value="Sosial & Keamanan">Sosial & Keamanan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>Tanggal Pengeluaran:</label>
              <input 
                type="date" 
                value={expDate} 
                onChange={(e) => setExpDate(e.target.value)} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>Nominal (Rp):</label>
              <input 
                type="number" 
                value={expAmount} 
                onChange={(e) => setExpAmount(e.target.value)} 
                placeholder="Contoh: 150000" 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>Untuk Keperluan Apa (Deskripsi Detail):</label>
              <textarea 
                value={expDesc} 
                onChange={(e) => setExpDesc(e.target.value)} 
                placeholder="Contoh: Pembelian 2 sak semen untuk perbaikan jembatan RT 01" 
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>Upload Nota / Kuitansi Belanja:</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => e.target.files && setExpFile(e.target.files[0])} 
                style={{ width: '100%', fontSize: '13px', color: '#475569' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={expLoading}
              style={{ padding: '12px 24px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}
            >
              {expLoading ? 'Menyimpan Pengeluaran...' : 'Simpan & Potong Kas Aktif'}
            </button>
          </form>
        </div>
      )}

      {/* 3. KONTEN SUB-TAB: KELOLA / HAPUS RIWAYAT */}
      {activeSubTab === 'manage' && (
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#1e293b' }}>Manajemen Seluruh Data Transaksi</h4>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '10px 14px' }}>Tanggal</th>
                  <th style={{ padding: '10px 14px' }}>Jenis</th>
                  <th style={{ padding: '10px 14px' }}>Keterangan</th>
                  <th style={{ padding: '10px 14px' }}>Nominal</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {allTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Belum ada data transaksi di sistem.</td>
                  </tr>
                ) : (
                  allTransactions.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', color: '#64748b' }}>{t.transaction_date}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontWeight: 600, color: t.type === 'masuk' ? '#16a34a' : '#dc2626' }}>
                          {t.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>{t.contributor_name || t.description}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>Rp {t.amount.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ 
                          padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                          background: t.status === 'approved' ? '#f0fdf4' : '#fefce8',
                          color: t.status === 'approved' ? '#16a34a' : '#ca8a04'
                        }}>
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <button 
                          onClick={() => handleDeleteTransaction(t.id)}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
