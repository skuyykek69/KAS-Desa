import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '', 
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface PendingTransaction {
  id: string;
  created_at: string;
  amount: number;
  contributor_name: string;
  proof_url: string;
}

export default function AdminApprovalPanel() {
  const [pendingList, setPendingList] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchPendingData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('id, created_at, amount, contributor_name, proof_url')
      .eq('type', 'masuk')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data pending:', error.message);
    } else {
      setPendingList(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingData();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      alert(`Gagal menyetujui transaksi: ${error.message}`);
    } else {
      // Refresh list setelah sukses
      setPendingList((prev) => prev.filter((item) => item.id !== id));
    }
    setActionLoadingId(null);
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Yakin ingin menolak dan menghapus catatan setoran ini?')) return;
    
    setActionLoadingId(id);
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      alert(`Gagal menghapus transaksi: ${error.message}`);
    } else {
      setPendingList((prev) => prev.filter((item) => item.id !== id));
    }
    setActionLoadingId(null);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Memuat daftar antrean verifikasi...</div>;

  return (
    <div style={{ maxWidth: '650px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Panel Verifikasi Mutasi Kas (Khusus Bendahara)</h3>
      {pendingList.length === 0 ? (
        <p style={{ color: '#666' }}>Tidak ada setoran warga yang menunggu verifikasi saat ini.</p>
      ) : (
        pendingList.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '12px 0' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{item.contributor_name}</p>
              <p style={{ margin: '0 0 4px 0', color: '#0070f3' }}>Rp {item.amount.toLocaleString('id-ID')}</p>
              <a href={item.proof_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#555' }}>
                🔍 Lihat Foto Bukti Transfer
              </a>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => handleApprove(item.id)}
                disabled={actionLoadingId === item.id}
                style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
              >
                {actionLoadingId === item.id ? 'Memproses...' : 'Setujui'}
              </button>
              <button 
                onClick={() => handleReject(item.id)}
                disabled={actionLoadingId === item.id}
                style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Tolak
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
