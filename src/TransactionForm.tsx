import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '', 
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export default function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [amount, setAmount] = useState<string>('');
  const [contributorName, setContributorName] = useState<string>('');
  const [category, setCategory] = useState<string>('Iuran Warga Bulanan');
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!amount || Number(amount) <= 0) {
      setErrorMsg('Masukkan nominal iuran dengan benar.');
      return;
    }
    if (!contributorName.trim()) {
      setErrorMsg('Harap isi nama lengkap warga dan asal RT/RW.');
      return;
    }
    if (!file) {
      setErrorMsg('Wajib melampirkan foto bukti transfer (m-banking / kuitansi).');
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (uploadError) throw new Error(`Gagal upload file: ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      const payload = {
        type: 'masuk',
        amount: Number(amount),
        category,
        contributor_name: contributorName,
        description: `Setoran iuran dari ${contributorName}`,
        transaction_date: transactionDate,
        proof_url: publicUrlData.publicUrl,
        status: 'pending', // Menunggu verifikasi bendahara
      };

      const { error: dbError } = await supabase
        .from('transactions')
        .insert([payload]);

      if (dbError) throw new Error(`Gagal menyimpan ke database: ${dbError.message}`);

      alert('Setoran iuran berhasil dikirim! Menunggu validasi dari bendahara desa.');
      setAmount('');
      setContributorName('');
      setFile(null);
      if (onSuccess) onSuccess();

    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', background: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Form Setor Iuran Warga</h3>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Laporkan transfer iuran Anda agar dapat divalidasi oleh bendahara dan masuk ke kas aktif.</p>
      
      {errorMsg && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px', border: '1px solid #fecaca' }}>{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>Kategori Setoran:</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px' }}
          >
            <option value="Iuran Warga Bulanan">Iuran Warga Bulanan</option>
            <option value="Donasi / Sumbangan">Donasi / Sumbangan Warga</option>
            <option value="Dana Bantuan Pemerintah">Dana Bantuan Pemerintah</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>Tanggal Transfer / Setor:</label>
          <input 
            type="date" 
            value={transactionDate} 
            onChange={(e) => setTransactionDate(e.target.value)} 
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>Nominal (Rp):</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="Contoh: 50000" 
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>Atas Nama (Nama Lengkap & RT/RW):</label>
          <input 
            type="text" 
            value={contributorName} 
            onChange={(e) => setContributorName(e.target.value)} 
            placeholder="Contoh: Budi Santoso (RT 02/RW 01)" 
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>Upload Bukti Transfer (Screenshot M-Banking):</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => e.target.files && setFile(e.target.files[0])} 
            style={{ width: '100%', fontSize: '13px', color: '#475569' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}
        >
          {loading ? 'Mengunggah & Mengirim...' : 'Kirim Bukti Setoran'}
        </button>
      </form>
    </div>
  );
}
