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
      setErrorMsg('Wajib melampirkan foto bukti transfer.');
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
        status: 'pending',
      };

      const { error: dbError } = await supabase
        .from('transactions')
        .insert([payload]);

      if (dbError) throw new Error(`Gagal menyimpan ke database: ${dbError.message}`);

      alert('Setoran berhasil dikirim! Menunggu validasi bendahara.');
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
    <div style={{ maxWidth: '480px', margin: '20px auto', background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px', color: '#09090b', letterSpacing: '-0.01em' }}>Form Setor Iuran Warga</h3>
      <p style={{ color: '#71717a', fontSize: '13.5px', marginBottom: '24px' }}>Kirimkan bukti transfer untuk divalidasi ke kas aktif desa.</p>
      
      {errorMsg && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px', border: '1px solid #fecaca' }}>{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#3f3f46' }}>Kategori Setoran:</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d4d4d8', background: '#fff', fontSize: '14px', outline: 'none' }}
          >
            <option value="Iuran Warga Bulanan">Iuran Warga Bulanan</option>
            <option value="Donasi / Sumbangan">Donasi / Sumbangan Warga</option>
            <option value="Dana Bantuan Pemerintah">Dana Bantuan Pemerintah</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#3f3f46' }}>Tanggal Transfer:</label>
          <input 
            type="date" 
            value={transactionDate} 
            onChange={(e) => setTransactionDate(e.target.value)} 
            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#3f3f46' }}>Nominal (Rp):</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="50000" 
            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#3f3f46' }}>Atas Nama (Nama & RT/RW):</label>
          <input 
            type="text" 
            value={contributorName} 
            onChange={(e) => setContributorName(e.target.value)} 
            placeholder="Budi Santoso (RT 02/RW 01)" 
            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#3f3f46' }}>Foto Bukti Transfer:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => e.target.files && setFile(e.target.files[0])} 
            style={{ width: '100%', fontSize: '13px', color: '#71717a' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#09090b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}
        >
          {loading ? 'Mengunggah...' : 'Kirim Bukti Setoran'}
        </button>
      </form>
    </div>
  );
}
