import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '', 
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Transaction {
  id: string;
  created_at: string;
  type: 'masuk' | 'keluar';
  amount: number;
  contributor_name: string | null;
  description: string | null;
  proof_url: string;
  status: string;
}

export default function PublicDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchApprovedTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal memuat data kas:', error.message);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApprovedTransactions();
  }, []);

  const totalMasuk = transactions
    .filter((t) => t.type === 'masuk')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalKeluar = transactions
    .filter((t) => t.type === 'keluar')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const saldoAkhir = totalMasuk - totalKeluar;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Memuat laporan keuangan real-time...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Transparansi Keuangan Kas Desa</h2>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Laporan dana masuk dan keluar yang telah divalidasi secara transparan.</p>
      </div>

      {/* Kartu Ringkasan Keuangan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Saldo Kas Aktif</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '26px', fontWeight: 700, color: '#2563eb' }}>
            Rp {saldoAkhir.toLocaleString('id-ID')}
          </p>
        </div>
        
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Akumulasi Pemasukan</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>
            Rp {totalMasuk.toLocaleString('id-ID')}
          </p>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Akumulasi Pengeluaran</span>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>
            Rp {totalKeluar.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Tabel Riwayat */}
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1e293b' }}>Riwayat Transaksi Sah</h3>
      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tanggal</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Keterangan / Nama</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Jenis</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Nominal</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Bukti</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  Belum ada catatan transaksi divalidasi.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(tx.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>
                    {tx.type === 'masuk' ? `Iuran: ${tx.contributor_name}` : tx.description}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
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
                      Lihat Foto ↗
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
