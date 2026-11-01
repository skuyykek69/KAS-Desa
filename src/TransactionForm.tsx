import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '', 
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export default function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [type, setType] = useState<'masuk' | 'keluar'>('masuk');
  const [amount, setAmount] = useState<string>('');
  const [nameOrDesc, setNameOrDesc] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!amount || Number(amount) <= 0) {
      setErrorMsg('Nominal uang harus diisi dengan benar.');
      return;
    }
    if (!file) {
      setErrorMsg('Wajib mengunggah foto bukti transfer atau nota.');
      return;
    }
    if (type === 'masuk' && !nameOrDesc.trim()) {
      setErrorMsg('Harap isi kolom "Atas Nama" untuk uang masuk.');
      return;
    }
    if (type === 'keluar' && !nameOrDesc.trim()) {
      setErrorMsg('Harap isi kolom "Keperluan" untuk uang keluar.');
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

      const proofUrl = publicUrlData.publicUrl;

      const payload = {
        type,
        amount: Number(amount),
        contributor_name: type === 'masuk' ? nameOrDesc : null,
        description: type === 'keluar' ? nameOrDesc : 'Setoran iuran kas warga',
        proof_url: proofUrl,
        status: type === 'masuk' ? 'pending' : 'approved',
      };

      const { error: dbError } = await supabase
        .from('transactions')
        .insert([payload]);

      if (dbError) throw new Error(`Gagal menyimpan ke database: ${dbError.message}`);

      alert(type === 'masuk' ? 'Setoran berhasil dikirim! Menunggu verifikasi bendahara.' : 'Pengeluaran kas berhasil dicatat.');
      
      setAmount('');
      setNameOrDesc('');
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
      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Form Pencatatan Kas</h3>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Laporkan iuran masuk atau pengeluaran kas dengan melampirkan foto bukti sah.</p>
      
      {errorMsg && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px', border: '1px solid #fecaca' }}>{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>Jenis Transaksi:</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value as 'masuk' | 'keluar')} 
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px' }}
          >
            <option value="masuk">Uang Masuk (Iuran / Donasi)</option>
            <option value="keluar">Uang Keluar (Belanja / Operasional)</option>
          </select>
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
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
            {type === 'masuk' ? 'Atas Nama (Warga / Donatur):' : 'Untuk Keperluan Apa (Deskripsi):'}
          </label>
          <input 
            type="text" 
            value={nameOrDesc} 
            onChange={(e) => setNameOrDesc(e.target.value)} 
            placeholder={type === 'masuk' ? 'Nama lengkap warga' : 'Misal: Perbaikan lampu jalan RT 02'} 
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>Upload Bukti (Foto Transfer / Nota):</label>
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
          style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }}
        >
          {loading ? 'Mengunggah & Menyimpan...' : 'Kirim Transaksi'}
        </button>
      </form>
    </div>
  );
}
