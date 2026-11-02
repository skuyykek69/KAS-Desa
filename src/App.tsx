import { useState } from 'react';
import PublicDashboard from './PublicDashboard';
import TransactionForm from './TransactionForm';
import AdminApprovalPanel from './AdminApprovalPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'deposit' | 'admin-login' | 'admin-panel'>('dashboard');
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const ADMIN_PIN = "325277"; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAdminAuth(true);
      setPinError('');
      setActiveTab('admin-panel');
      setPin('');
    } else {
      setPinError('PIN Bendahara tidak valid.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar Modern FinTech */}
      <nav className="nav-flex" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        background: '#ffffff',
        borderBottom: '1px solid #e4e4e7',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#09090b', letterSpacing: '-0.01em' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', display: 'inline-block' }}></span>
          Keuangan Desa Terintegrasi
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '7px 14px', borderRadius: '6px', border: 'none', fontWeight: 500, fontSize: '13.5px', cursor: 'pointer',
              background: activeTab === 'dashboard' ? '#09090b' : 'transparent',
              color: activeTab === 'dashboard' ? '#ffffff' : '#71717a',
              transition: 'all 0.15s ease'
            }}
          >
            Dashboard Publik
          </button>
          <button 
            onClick={() => setActiveTab('deposit')}
            style={{
              padding: '7px 14px', borderRadius: '6px', border: 'none', fontWeight: 500, fontSize: '13.5px', cursor: 'pointer',
              background: activeTab === 'deposit' ? '#09090b' : 'transparent',
              color: activeTab === 'deposit' ? '#ffffff' : '#71717a',
              transition: 'all 0.15s ease'
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
              padding: '7px 14px', borderRadius: '6px', border: 'none', fontWeight: 500, fontSize: '13.5px', cursor: 'pointer',
              background: (activeTab === 'admin-panel' || activeTab === 'admin-login') ? '#27272a' : 'transparent',
              color: (activeTab === 'admin-panel' || activeTab === 'admin-login') ? '#ffffff' : '#71717a',
              border: '1px solid #e4e4e7'
            }}
          >
            🔒 Portal Bendahara
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1080px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'dashboard' && <PublicDashboard />}
        {activeTab === 'deposit' && <TransactionForm onSuccess={() => setActiveTab('dashboard')} />}

        {activeTab === 'admin-login' && !isAdminAuth && (
          <div style={{ maxWidth: '380px', margin: '60px auto', background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ marginBottom: '6px', fontSize: '18px', fontWeight: 600, color: '#09090b', letterSpacing: '-0.01em' }}>Otorisasi Bendahara</h3>
            <p style={{ fontSize: '13.5px', color: '#71717a', marginBottom: '20px' }}>Masukkan PIN pengurus untuk mengakses panel validasi.</p>
            
            {pinError && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fecaca' }}>{pinError}</div>}
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#3f3f46' }}>PIN Akses:</label>
                <input 
                  type="password" 
                  value={pin} 
                  onChange={(e) => setPin(e.target.value)} 
                  placeholder="••••••" 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px', outline: 'none' }}
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                style={{ width: '100%', padding: '10px', background: '#09090b', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}
              >
                Masuk Sistem
              </button>
            </form>
          </div>
        )}

        {activeTab === 'admin-panel' && isAdminAuth && (
          <AdminApprovalPanel onLogout={() => { setIsAdminAuth(false); setActiveTab('dashboard'); }} />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '24px', color: '#a1a1aa', fontSize: '12.5px', borderTop: '1px solid #e4e4e7', background: '#ffffff' }}>
        &copy; 2026 Transparansi Keuangan Desa. Dibangun dengan standar akuntabilitas publik.
      </footer>
    </div>
  );
}
