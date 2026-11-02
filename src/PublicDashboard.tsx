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

export default function PublicDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const fetchApprovedTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'approved')
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data kas:', error.message);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApprovedTransactions();
  }, []);

  // Filter berdasarkan bulan & kata kunci pencarian
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = 
      (t.contributor_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (t.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedMonth === 'all') return matchesSearch;

    const txMonth = t.transaction_date ? t.transaction_date.slice(0, 7) : t.created_at.slice(0, 7);
    return matchesSearch && txMonth === selectedMonth;
  });

  // Hitung total keseluruhan (All-Time Saldo)
  const totalMasukAll = transactions.filter(t => t.type === 'masuk').reduce((acc, curr) => acc + curr.amount, 0);
  const totalKeluarAll = transactions.filter(t => t.type === 'keluar').reduce((acc, curr) => acc + curr.amount, 0);
  const saldoAkhir = totalMasukAll - totalKeluarAll;

  // Hitung total Bulan Ini (Berdasarkan filter atau bulan berjalan saat ini)
  const currentYMD = new Date().toISOString().slice(0, 7);
  const activeMonthFilter = selectedMonth === 'all' ? currentYMD : selectedMonth;

  const monthTransactions = transactions.filter(t => {
    const txMonth = t.transaction_date ? t.transaction_date.slice(0, 7) : t.created_at.slice(0, 7);
    return txMonth === activeMonthFilter;
  });

  const totalMasukBulanIni = monthTransactions.filter(t => t.type === 'masuk').reduce((acc, curr) => acc + curr.amount, 0);
  const totalKeluarBulanIni = monthTransactions.filter(t => t.type === 'keluar').reduce((acc, curr) => acc + curr.amount, 0);

  // Daftar opsi bulan unik dari riwayat data
  const availableMonths = Array.from(new Set(transactions.map(t => {
    return t.transaction_date ? t.transaction_date.slice(0, 7) : t.created_at.slice(0, 7);
  }))).sort().reverse();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Memuat transparansi keuangan kas desa...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Transparansi Keuangan Desa</h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Seluruh catatan pemasukan iuran dan pengeluaran dana desa yang sah secara real-time.</p>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Filter Periode Bulan:</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', fontWeight: 500 }}
          >
            <option value="all">Semua Periode (All-Time)</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>{new Date(m + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kartu Ringkasan Keuangan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Saldo Kas Aktif</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '26px', fontWeight: 700, color: '#2563eb' }}>
            Rp {saldoAkhir.toLocaleString('id-ID')}
          </p>
        </div>
        
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderLeft: '4px solid #16a34a' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pemasukan Periode Ini</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>
            Rp {totalMasukBulanIni.toLocaleString('id-ID')}
          </p>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderLeft: '4px solid #dc2626' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pengeluaran Periode Ini</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>
            Rp {totalKeluarBulanIni.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Kotak Pencarian & Filter Tabel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Riwayat Transaksi Sah ({filteredTransactions.length})</h3>
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama warga, kategori, atau keperluan..." 
          style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '280px', fontSize: '14px', background: '#fff' }}
        />
      </div>

      {/* Tabel Data */}
      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tanggal</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Kategori</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Keterangan / Nama Warga</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Jenis</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Nominal</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Bukti</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  Tidak ada catatan transaksi yang ditemukan pada periode/pencarian ini.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(tx.transaction_date || tx.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, color: '#334155' }}>
                      {tx.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>
                    {tx.type === 'masuk' ? `Setoran: ${tx.contributor_name}` : tx.description}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                      color: tx.type === 'masuk' ? '#16a34a' : '#dc2626',
                      background: tx.type === 'masuk' ? '#f0fdf4' : '#fef2f2'
                    }}>
                      {tx.type === 'masuk' ? 'Masuk' : 'Keluar'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: tx.type === 'masuk' ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                    {tx.type === 'masuk' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <a 
                      href={tx.proof_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500, fontSize: '13px' }}
                    >
                      Lihat Nota ↗
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
