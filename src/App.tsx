import { useState } from 'react';
import PublicDashboard from './PublicDashboard';
import TransactionForm from './TransactionForm';
import AdminApprovalPanel from './AdminApprovalPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'admin'>('dashboard');

  return (
    <div>
      {/* Navigasi Sederhana */}
      <nav style={{ display: 'flex', gap: '10px', padding: '15px', background: '#333', color: 'white', justifyContent: 'center' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Dashboard Publik</button>
        <button onClick={() => setActiveTab('form')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Setor / Catat Transaksi</button>
        <button onClick={() => setActiveTab('admin')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Panel Admin (Bendahara)</button>
      </nav>

      {/* Konten Halaman Berdasarkan Tab */}
      <main style={{ padding: '20px' }}>
        {activeTab === 'dashboard' && <PublicDashboard />}
        {activeTab === 'form' && <TransactionForm onSuccess={() => setActiveTab('dashboard')} />}
        {activeTab === 'admin' && <AdminApprovalPanel />}
      </main>
    </div>
  );
}
