import React, { useEffect, useState } from 'react';
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

  // Ambil hanya transaksi yang sudah disetujui (approved)
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

  // Hitung ringkasan keuangan
  const totalMasuk = transactions
    .filter((t) => t.type === 'masuk')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalKeluar = transactions
    .filter((t) => t.type === 'keluar')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const saldoAkhir = totalMasuk - totalKeluar;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Memuat transparansi kas desa...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2>Transparansi Kas Desa / Organisasi</h2>
        <p style={{ color: '#666' }}>Laporan keuangan real-time yang dapat diakses oleh seluruh warga.</p>
      </header>

      {/* Kartu Ringkasan Saldo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#f0f4f8', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #0070f3' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Total Saldo Kas Aktif</h4>
          <p style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#0070f3' }}>
            Rp {saldoAkhir.toLocaleString('id-ID')}
          </p>
        </div>
        
        <div style={{ background: '#f1f8f5', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #28a745' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Akumulasi Pemasukan</h4>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
            Rp {totalMasuk.toLocaleString('id-ID')}
          </p>
        </div>

        <div style={{ background: '#fdf3f4', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #dc3545' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Akumulasi Pengeluaran</h4>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
            Rp {totalKeluar.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Tabel Riwayat Transaksi */}
      <h3>Riwayat Transaksi Sah</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: 'white' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Tanggal</th>
              <th style={{ padding: '12px' }}>Keterangan / Atas Nama</th>
              <th style={{ padding: '12px' }}>Jenis</th>
              <th style={{ padding: '12px' }}>Nominal</th>
              <th style={{ padding: '12px' }}>Bukti</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                  Belum ada data transaksi yang disetujui.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#555' }}>
                    {new Date(tx.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>
                    {tx.type === 'masuk' ? `Setoran: ${tx.contributor_name}` : tx.description}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: 'white',
                      backgroundColor: tx.type === 'masuk' ? '#28a745' : '#dc3545'
                    }}>
                      {tx.type === 'masuk' ? 'Masuk' : 'Keluar'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: tx.type === 'masuk' ? '#28a745' : '#dc3545' }}>
                    {tx.type === 'masuk' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <a 
                      href={tx.proof_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#0070f3', textDecoration: 'none', fontSize: '14px' }}
                    >
                      Lihat Nota
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
