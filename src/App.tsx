import { useState } from 'react';
import PublicDashboard from './PublicDashboard';
import TransactionForm from './TransactionForm';
import AdminApprovalPanel from './AdminApprovalPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'deposit' | 'admin-login' | 'admin-panel'>('dashboard');
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const ADMIN_PIN = "123456"; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAdminAuth(true);
      setPinError('');
      setActiveTab('admin-panel');
      setPin('');
    } else {
      setPinError('Otorisasi ditolak: PIN salah.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f4f5' }}>
      {/* Header Industrial Style */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        background: '#09090b',
        color: '#ffffff',
        borderBottom: '2px solid #27272a'
      }}>
        <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: '#10b981', width: '10px', height: '10px', display: 'inline-block' }}></span>
          SISTEM KEUANGAN DESA // LIVE TERMINAL
        </div>
        <nav style={{ display: 'flex', gap: '2px' }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
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
            onClick={() => setActiveTab('deposit')}
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
              if (isAdminAuth) setActiveTab('admin-panel');
              else setActiveTab('admin-login');
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

      {/* Main Content Terminal */}
      <main style={{ flex: 1, padding: '32px 24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
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
