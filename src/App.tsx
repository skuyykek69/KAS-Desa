import { useState } from 'react';
import PublicDashboard from './PublicDashboard';
import TransactionForm from './TransactionForm';
import AdminApprovalPanel from './AdminApprovalPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'deposit' | 'admin-login' | 'admin-panel'>('dashboard');
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const ADMIN_PIN = "325277"; // PIN rahasia bendahara

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAdminAuth(true);
      setPinError('');
      setActiveTab('admin-panel');
      setPin('');
    } else {
      setPinError('PIN Bendahara salah. Silakan coba kembali.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar Navigasi Utama */}
      <nav className="nav-flex" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        <div style={{ fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
          <span>🏛️</span> Sistem Keuangan Kas Desa
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 500, cursor: 'pointer',
              background: activeTab === 'dashboard' ? '#2563eb' : 'transparent',
              color: activeTab === 'dashboard' ? '#ffffff' : '#475569',
              transition: 'all 0.2s'
            }}
          >
            Dashboard Publik
          </button>
          <button 
            onClick={() => setActiveTab('deposit')}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 500, cursor: 'pointer',
              background: activeTab === 'deposit' ? '#2563eb' : 'transparent',
              color: activeTab === 'deposit' ? '#ffffff' : '#475569',
              transition: 'all 0.2s'
            }}
          >
            + Setor Iuran Warga
          </button>
          <button 
            onClick={() => {
              if (isAdminAuth) setActiveTab('admin-panel');
              else setActiveTab('admin-login');
            }}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 500, cursor: 'pointer',
              background: (activeTab === 'admin-panel' || activeTab === 'admin-login') ? '#0f172a' : 'transparent',
              color: (activeTab === 'admin-panel' || activeTab === 'admin-login') ? '#ffffff' : '#475569',
              transition: 'all 0.2s'
            }}
          >
            🔒 Panel Bendahara
          </button>
        </div>
      </nav>

      {/* Konten Berdasarkan Tab Aktif */}
      <main style={{ flex: 1, padding: '32px 16px', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'dashboard' && <PublicDashboard />}
        {activeTab === 'deposit' && <TransactionForm onSuccess={() => setActiveTab('dashboard')} />}

        {activeTab === 'admin-login' && !isAdminAuth && (
          <div style={{ maxWidth: '400px', margin: '40px auto', background: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ marginBottom: '8px', fontSize: '20px', color: '#0f172a' }}>Otorisasi Bendahara</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Masukkan PIN pengurus untuk mengakses panel validasi & input pengeluaran.</p>
            
            {pinError && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fecaca' }}>{pinError}</div>}
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>PIN Keamanan:</label>
                <input 
                  type="password" 
                  value={pin} 
                  onChange={(e) => setPin(e.target.value)} 
                  placeholder="Masukkan 6 digit PIN" 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                Masuk Sistem Admin
              </button>
            </form>
          </div>
        )}

        {activeTab === 'admin-panel' && isAdminAuth && (
          <AdminApprovalPanel onLogout={() => { setIsAdminAuth(false); setActiveTab('dashboard'); }} />
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
        &copy; 2026 Transparansi Kas Desa & Organisasi. Akuntabel, Transparan, & Terverifikasi.
      </footer>
    </div>
  );
}
