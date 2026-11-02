import { useState } from 'react';
import PublicDashboard from './PublicDashboard';
import TransactionForm from './TransactionForm';
import AdminApprovalPanel from './AdminApprovalPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'deposit' | 'admin-login' | 'admin-panel'>('dashboard');
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const ADMIN_PIN = "325277"; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAdminAuth(true);
      setPinError('');
      setActiveTab('admin-panel');
      setPin('');
      setIsMobileMenuOpen(false);
    } else {
      setPinError('Otorisasi ditolak: PIN salah.');
    }
  };

  const navigateTo = (tab: 'dashboard' | 'deposit' | 'admin-login' | 'admin-panel') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Tutup menu mobile setelah diklik
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f4f5' }}>
      {/* Header Industrial Style dengan Hamburger */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: '#09090b',
        color: '#ffffff',
        borderBottom: '2px solid #27272a',
        position: 'relative'
      }}>
        <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#10b981', width: '8px', height: '8px', display: 'inline-block' }}></span>
          <span>KEUANGAN DESA // LIVE</span>
        </div>

        {/* Tombol Hamburger untuk Mobile */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Navigasi Desktop */}
        <nav className="desktop-nav">
          <button 
            onClick={() => navigateTo('dashboard')}
            style={{
              padding: '8px 16px', border: 'none', fontWeight: 600, fontSize: '12px', cursor: 'pointer',
              background: activeTab === 'dashboard' ? '#ffffff' : '#27272a',
              color: activeTab === 'dashboard' ? '#09090b' : '#ffffff',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigateTo('deposit')}
            style={{
              padding: '8px 16px', border: 'none', fontWeight: 600, fontSize: '12px', cursor: 'pointer',
              background: activeTab === 'deposit' ? '#ffffff' : '#27272a',
              color: activeTab === 'deposit' ? '#09090b' : '#ffffff',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}
          >
            + Setor Iuran
          </button>
          <button 
            onClick={() => {
              if (isAdminAuth) navigateTo('admin-panel');
              else navigateTo('admin-login');
            }}
            style={{
              padding: '8px 16px', border: 'none', fontWeight: 600, fontSize: '12px', cursor: 'pointer',
              background: (activeTab === 'admin-panel' || activeTab === 'admin-login') ? '#3f3f46' : '#18181b',
              color: '#ffffff',
              borderLeft: '1px solid #3f3f46',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}
          >
            🔒 Portal Admin
          </button>
        </nav>
      </header>

      {/* Dropdown Menu Mobile (Tampil jika isMobileMenuOpen bernilai true) */}
      {isMobileMenuOpen && (
        <div style={{
          background: '#18181b',
          borderBottom: '2px solid #27272a',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px 24px',
          gap: '8px',
          zIndex: 50
        }}>
          <button 
            onClick={() => navigateTo('dashboard')}
            style={{
              padding: '10px 14px', border: 'none', fontWeight: 600, fontSize: '13px', textAlign: 'left', cursor: 'pointer',
              background: activeTab === 'dashboard' ? '#ffffff' : '#27272a',
              color: activeTab === 'dashboard' ? '#09090b' : '#ffffff',
              textTransform: 'uppercase'
            }}
          >
            Dashboard Publik
          </button>
          <button 
            onClick={() => navigateTo('deposit')}
            style={{
              padding: '10px 14px', border: 'none', fontWeight: 600, fontSize: '13px', textAlign: 'left', cursor: 'pointer',
              background: activeTab === 'deposit' ? '#ffffff' : '#27272a',
              color: activeTab === 'deposit' ? '#09090b' : '#ffffff',
              textTransform: 'uppercase'
            }}
          >
            + Setor Iuran Warga
          </button>
          <button 
            onClick={() => {
              if (isAdminAuth) navigateTo('admin-panel');
              else navigateTo('admin-login');
            }}
            style={{
              padding: '10px 14px', border: 'none', fontWeight: 600, fontSize: '13px', textAlign: 'left', cursor: 'pointer',
              background: (activeTab === 'admin-panel' || activeTab === 'admin-login') ? '#3f3f46' : '#27272a',
              color: '#ffffff',
              textTransform: 'uppercase'
            }}
          >
            🔒 Portal Admin / Bendahara
          </button>
        </div>
      )}

      {/* Main Content Terminal */}
      <main style={{ flex: 1, padding: '32px 16px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'dashboard' && <PublicDashboard />}
        {activeTab === 'deposit' && <TransactionForm onSuccess={() => setActiveTab('dashboard')} />}

        {activeTab === 'admin-login' && !isAdminAuth && (
          <div style={{ maxWidth: '400px', margin: '40px auto', background: '#ffffff', padding: '32px', border: '1px solid #27272a' }}>
            <h3 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 700, textTransform: 'uppercase' }}>Otorisasi Pengurus</h3>
            <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '20px' }}>Masukkan PIN pengaman bendahara untuk masuk.</p>
            
            {pinError && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px', fontSize: '12px', marginBottom: '16px', border: '1px solid #fecaca' }}>{pinError}</div>}
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>PIN Akses:</label>
                <input 
                  type="password" 
                  value={pin} 
                  onChange={(e) => setPin(e.target.value)} 
                  placeholder="******" 
                  style={{ width: '100%', padding: '10px', border: '1px solid #27272a', fontSize: '14px', outline: 'none' }}
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                style={{ width: '100%', padding: '10px', background: '#09090b', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                Autentikasi Sesi
              </button>
            </form>
          </div>
        )}

        {activeTab === 'admin-panel' && isAdminAuth && (
          <AdminApprovalPanel onLogout={() => { setIsAdminAuth(false); setActiveTab('dashboard'); }} />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', color: '#71717a', fontSize: '11px', borderTop: '1px solid #d4d4d8', background: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Sistem Akuntabilitas Keuangan Publik &copy; 2026
      </footer>
    </div>
  );
}
