import { useEffect, useState } from 'react';
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

export default function AdminApprovalPanel({ onLogout }: { onLogout: () => void }) {
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

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Memuat daftar antrean verifikasi...</div>;

  return (
    <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Panel Verifikasi Mutasi Kas</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Setoran masuk warga yang memerlukan validasi mutasi rekening bank.</p>
        </div>
        <button 
          onClick={onLogout}
          style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#334155' }}
        >
          Keluar Sesi Admin
        </button>
      </div>

      {pendingList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
          Tidak ada setoran warga yang menunggu verifikasi saat ini.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pendingList.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', background: '#f8fafc', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>{item.contributor_name}</p>
                <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#2563eb' }}>Rp {item.amount.toLocaleString('id-ID')}</p>
                <a href={item.proof_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                  🔍 Lihat Foto Bukti Transfer ↗
                </a>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleApprove(item.id)}
                  disabled={actionLoadingId === item.id}
                  style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  {actionLoadingId === item.id ? 'Memproses...' : 'Setujui'}
                </button>
                <button 
                  onClick={() => handleReject(item.id)}
                  disabled={actionLoadingId === item.id}
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
  );
}
