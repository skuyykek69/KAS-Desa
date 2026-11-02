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

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = 
      (t.contributor_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (t.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedMonth === 'all') return matchesSearch;

    const txMonth = t.transaction_date ? t.transaction_date.slice(0, 7) : t.created_at.slice(0, 7);
    return matchesSearch && txMonth === selectedMonth;
  });

  const totalMasukAll = transactions.filter(t => t.type === 'masuk').reduce((acc, curr) => acc + curr.amount, 0);
  const totalKeluarAll = transactions.filter(t => t.type === 'keluar').reduce((acc, curr) => acc + curr.amount, 0);
  const saldoAkhir = totalMasukAll - totalKeluarAll;

  const currentYMD = new Date().toISOString().slice(0, 7);
  const activeMonthFilter = selectedMonth === 'all' ? currentYMD : selectedMonth;

  const monthTransactions = transactions.filter(t => {
    const txMonth = t.transaction_date ? t.transaction_date.slice(0, 7) : t.created_at.slice(0, 7);
    return txMonth === activeMonthFilter;
  });

  const totalMasukBulanIni = monthTransactions.filter(t => t.type === 'masuk').reduce((acc, curr) => acc + curr.amount, 0);
  const totalKeluarBulanIni = monthTransactions.filter(t => t.type === 'keluar').reduce((acc, curr) => acc + curr.amount, 0);

  const availableMonths = Array.from(new Set(transactions.map(t => {
    return t.transaction_date ? t.transaction_date.slice(0, 7) : t.created_at.slice(0, 7);
  }))).sort().reverse();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#71717a', fontSize: '14px' }}>Memuat data keuangan...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#09090b', letterSpacing: '-0.02em', marginBottom: '4px' }}>Laporan Transparansi Kas Desa</h2>
          <p style={{ color: '#71717a', fontSize: '14px' }}>Ringkasan seluruh arus kas masuk dan keluar yang transparan dan akuntabel.</p>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: '#71717a', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Periode:</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #d4d4d8', background: '#fff', fontSize: '13.5px', fontWeight: 500, color: '#09090b', outline: 'none' }}
          >
            <option value="all">Semua Periode (All-Time)</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>{new Date(m + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kartu Ringkasan Statistik */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e4e4e7', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 500, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Saldo Kas Aktif</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 600, color: '#09090b', letterSpacing: '-0.02em' }}>
            Rp {saldoAkhir.toLocaleString('id-ID')}
          </p>
        </div>
        
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e4e4e7', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 500, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pemasukan Periode Ini</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '22px', fontWeight: 600, color: '#059669', letterSpacing: '-0.02em' }}>
            Rp {totalMasukBulanIni.toLocaleString('id-ID')}
          </p>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e4e4e7', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 500, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pengeluaran Periode Ini</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '22px', fontWeight: 600, color: '#dc2626', letterSpacing: '-0.02em' }}>
            Rp {totalKeluarBulanIni.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Kontrol Tabel & Pencarian */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#09090b' }}>Riwayat Transaksi Sah ({filteredTransactions.length})</h3>
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan nama atau keterangan..." 
          style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #d4d4d8', width: '260px', fontSize: '13.5px', background: '#fff', outline: 'none' }}
        />
      </div>

      {/* Tabel Data Finansial */}
      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #e4e4e7', color: '#71717a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Tanggal</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Kategori</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Keterangan / Nama</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Jenis</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Nominal</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Bukti</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#a1a1aa' }}>
                  Tidak ada catatan transaksi ditemukan.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                  <td style={{ padding: '12px 16px', color: '#71717a', whiteSpace: 'nowrap' }}>
                    {new Date(tx.transaction_date || tx.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: '#f4f4f5', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, color: '#3f3f46' }}>
                      {tx.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#09090b' }}>
                    {tx.type === 'masuk' ? `Setoran: ${tx.contributor_name}` : tx.description}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 7px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500,
                      color: tx.type === 'masuk' ? '#059669' : '#dc2626',
                      background: tx.type === 'masuk' ? '#ecfdf5' : '#fef2f2'
                    }}>
                      {tx.type === 'masuk' ? 'Masuk' : 'Keluar'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: tx.type === 'masuk' ? '#059669' : '#dc2626', whiteSpace: 'nowrap' }}>
                    {tx.type === 'masuk' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <a 
                      href={tx.proof_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#09090b', textDecoration: 'none', fontWeight: 500, fontSize: '13px', borderBottom: '1px solid #09090b', paddingBottom: '1px' }}
                    >
                      Nota ↗
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
