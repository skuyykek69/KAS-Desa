import { useState } from 'react';
import PublicDashboard from './PublicDashboard';
import TransactionForm from './TransactionForm';
import AdminApprovalPanel from './AdminApprovalPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'admin'>('dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // PIN Rahasia Bendahara (Bisa disesuaikan atau di-env)
  const ADMIN_PIN = "325277"; 

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAdminAuthenticated(true);
      setPinError('');
      setActiveTab('admin');
      setPinInput('');
    } else {
      setPinError('PIN Bendahara salah! Silakan coba lagi.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar Profesional */}
      <nav className="nav-container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 32px', 
        background: '#ffffff', 
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🏛️</span> Kas Desa Transparan
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            style={{ 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none', 
              background: activeTab === 'dashboard' ? '#2563eb' : 'transparent',
              color: activeTab === 'dashboard' ? '#ffffff' : '#475569',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Dashboard Publik
          </button>
          <button 
            onClick={() => setActiveTab('form')} 
            style={{ 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none', 
              background: activeTab === 'form' ? '#2563eb' : 'transparent',
              color: activeTab === 'form' ? '#ffffff' : '#475569',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            + Setor / Lapor
          </button>
          <button 
            onClick={() => {
              if (isAdminAuthenticated) {
                setActiveTab('admin');
              } else {
                setActiveTab('admin-login');
              }
            }} 
            style={{ 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none', 
              background: (activeTab === 'admin' || activeTab === 'admin-login') ? '#1e293b' : 'transparent',
              color: (activeTab === 'admin' || activeTab === 'admin-login') ? '#ffffff' : '#475569',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🔒 Panel Bendahara
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 16px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'dashboard' && <PublicDashboard />}
        {activeTab === 'form' && <TransactionForm onSuccess={() => setActiveTab('dashboard')} />}
        
        {activeTab === 'admin-login' && !isAdminAuthenticated && (
          <div style={{ maxWidth: '400px', margin: '40px auto', background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '8px', color: '#0f172a' }}>Otorisasi Bendahara</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Masukkan PIN keamanan bendahara untuk mengakses panel validasi mutasi.</p>
            
            {pinError && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fecaca' }}>{pinError}</div>}
            
            <form onSubmit={handleAdminAccess}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>PIN Akses:</label>
                <input 
                  type="password" 
                  value={pinInput} 
                  onChange={(e) => setPinInput(e.target.value)} 
                  placeholder="Masukkan 6 digit PIN" 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                Masuk Panel Admin
              </button>
            </form>
          </div>
        )}

        {activeTab === 'admin' && isAdminAuthenticated && (
          <AdminApprovalPanel onLogout={() => { setIsAdminAuthenticated(false); setActiveTab('dashboard'); }} />
        )}
      </main>

      {/* Footer Minimalis */}
      <footer style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
        &copy; 2026 Transparansi Kas Desa & Organisasi. Seluruh data keuangan akuntabel & terverifikasi.
      </footer>
    </div>
  );
}
