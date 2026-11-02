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

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('transactions').update({ status: 'approved' }).eq('id', id);
    if (error) alert(`Gagal: ${error.message}`);
    else fetchData();
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Tolak dan hapus setoran ini?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) alert(`Gagal: ${error.message}`);
    else fetchData();
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Hapus transaksi ini dari sistem?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) alert(`Gagal: ${error.message}`);
    else fetchData();
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpError(null);

    if (!expAmount || Number(expAmount) <= 0) {
      setExpError('Masukkan nominal pengeluaran yang valid.');
      return;
    }
    if (!expDesc.trim()) {
      setExpError('Deskripsi pengeluaran wajib diisi.');
      return;
    }
    if (!expFile) {
      setExpError('Wajib melampirkan foto nota belanja.');
      return;
    }

    setExpLoading(true);
    try {
      const fileExt = expFile.name.split('.').pop();
      const fileName = `exp-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, expFile);
      if (uploadError) throw new Error(`Gagal upload nota: ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName);

      const payload = {
        type: 'keluar',
        amount: Number(expAmount),
        category: expCategory,
        contributor_name: null,
        description: expDesc,
        transaction_date: expDate,
        proof_url: publicUrlData.publicUrl,
        status: 'approved',
      };

      const { error: dbError } = await supabase.from('transactions').insert([payload]);
      if (dbError) throw new Error(`Gagal mencatat: ${dbError.message}`);

      alert('Pengeluaran kas berhasil dicatat.');
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

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#71717a' }}>Memuat panel...</div>;

  return (
    <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e4e4e7', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#09090b' }}>Portal Administrasi Bendahara</h3>
          <p style={{ color: '#71717a', fontSize: '13.5px' }}>Validasi mutasi iuran dan manajemen kas keluar.</p>
        </div>
        <button 
          onClick={onLogout}
          style={{ padding: '6px 12px', background: '#fafafa', border: '1px solid #d4d4d8', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#3f3f46' }}
        >
          Keluar Sesi
        </button>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', borderBottom: '1px solid #e4e4e7', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveSubTab('approval')}
          style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', fontWeight: 500, fontSize: '13.5px', cursor: 'pointer', background: activeSubTab === 'approval' ? '#09090b' : '#f4f4f5', color: activeSubTab === 'approval' ? '#fff' : '#71717a' }}
        >
          Verifikasi Masuk ({pendingList.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('expense')}
          style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', fontWeight: 500, fontSize: '13.5px', cursor: 'pointer', background: activeSubTab === 'expense' ? '#09090b' : '#f4f4f5', color: activeSubTab === 'expense' ? '#fff' : '#71717a' }}
        >
          + Catat Pengeluaran
        </button>
        <button 
          onClick={() => setActiveSubTab('manage')}
          style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', fontWeight: 500, fontSize: '13.5px', cursor: 'pointer', background: activeSubTab === 'manage' ? '#09090b' : '#f4f4f5', color: activeSubTab === 'manage' ? '#fff' : '#71717a' }}
        >
          Kelola Semua Riwayat ({allTransactions.length})
        </button>
      </div>

      {activeSubTab === 'approval' && (
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#09090b' }}>Antrean Setoran Pending</h4>
          {pendingList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#a1a1aa', border: '1px dashed #d4d4d8', borderRadius: '8px', fontSize: '13.5px' }}>
              Tidak ada setoran yang menunggu verifikasi.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingList.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e4e4e7', padding: '14px 16px', borderRadius: '8px', background: '#fafafa', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#71717a' }}>{item.transaction_date}</p>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '15px', color: '#09090b' }}>{item.contributor_name}</p>
                    <p style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: '#059669' }}>Rp {item.amount.toLocaleString('id-ID')}</p>
                    <a href={item.proof_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#09090b', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid #09090b' }}>
                      Lihat Bukti Transfer ↗
                    </a>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => handleApprove(item.id)}
                      style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Setujui
                    </button>
                    <button 
                      onClick={() => handleReject(item.id)}
                      style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}
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

      {activeSubTab === 'expense' && (
        <div style={{ maxWidth: '520px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#09090b' }}>Form Pengeluaran Kas</h4>
          
          {expError && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fecaca' }}>{expError}</div>}

          <form onSubmit={handleExpenseSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#3f3f46' }}>Kategori Pengeluaran:</label>
              <select 
                value={expCategory} 
                onChange={(e) => setExpCategory(e.target.value)} 
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d4d4d8', background: '#fff', fontSize: '14px', outline: 'none' }}
              >
                <option value="Operasional Desa">Operasional Desa</option>
                <option value="Infrastruktur & Pembangunan">Infrastruktur & Pembangunan</option>
                <option value="Sosial & Keamanan">Sosial & Keamanan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#3f3f46' }}>Tanggal Pengeluaran:</label>
              <input 
                type="date" 
                value={expDate} 
                onChange={(e) => setExpDate(e.target.value)} 
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#3f3f46' }}>Nominal (Rp):</label>
              <input 
                type="number" 
                value={expAmount} 
                onChange={(e) => setExpAmount(e.target.value)} 
                placeholder="150000" 
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#3f3f46' }}>Keperluan Pengeluaran:</label>
              <textarea 
                value={expDesc} 
                onChange={(e) => setExpDesc(e.target.value)} 
                placeholder="Contoh: Pembelian semen perbaikan jembatan" 
                rows={3}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#3f3f46' }}>Foto Nota Belanja:</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => e.target.files && setExpFile(e.target.files[0])} 
                style={{ width: '100%', fontSize: '13px', color: '#71717a' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={expLoading}
              style={{ padding: '10px 20px', backgroundColor: '#09090b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}
            >
              {expLoading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
            </button>
          </form>
        </div>
      )}

      {activeSubTab === 'manage' && (
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#09090b' }}>Kelola Riwayat Transaksi</h4>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e4e4e7', color: '#71717a', fontSize: '12px', textTransform: 'uppercase' }}>
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
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#a1a1aa' }}>Belum ada data.</td>
                  </tr>
                ) : (
                  allTransactions.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                      <td style={{ padding: '10px 14px', color: '#71717a' }}>{t.transaction_date}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontWeight: 600, color: t.type === 'masuk' ? '#059669' : '#dc2626' }}>
                          {t.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>{t.contributor_name || t.description}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>Rp {t.amount.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ 
                          padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 500,
                          background: t.status === 'approved' ? '#ecfdf5' : '#fefce8',
                          color: t.status === 'approved' ? '#059669' : '#ca8a04'
                        }}>
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <button 
                          onClick={() => handleDeleteTransaction(t.id)}
                          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
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
