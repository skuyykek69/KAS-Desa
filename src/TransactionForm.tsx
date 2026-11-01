import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi klien Supabase (Gunakan env variable pada produksi riil)
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
      setErrorMsg('Harap isi kolom "Untuk Keperluan Apa" untuk uang keluar.');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload file bukti ke Supabase Storage (Bucket: 'receipts')
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (uploadError) throw new Error(`Gagal upload file: ${uploadError.message}`);

      // 2. Ambil Public URL dari file yang di-upload
      const { data: publicUrlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      const proofUrl = publicUrlData.publicUrl;

      // 3. Simpan baris data ke tabel 'transactions'
      // Uang masuk berstatus 'pending' (butuh verifikasi), uang keluar langsung 'approved'
      const payload = {
        type,
        amount: Number(amount),
        contributor_name: type === 'masuk' ? nameOrDesc : null,
        description: type === 'keluar' ? nameOrDesc : 'Setoran iuran kas',
        proof_url: proofUrl,
        status: type === 'masuk' ? 'pending' : 'approved',
      };

      const { error: dbError } = await supabase
        .from('transactions')
        .insert([payload]);

      if (dbError) throw new Error(`Gagal menyimpan ke database: ${dbError.message}`);

      alert(type === 'masuk' ? 'Setoran berhasil dikirim! Menunggu verifikasi bendahara.' : 'Pengeluaran kas berhasil dicatat.');
      
      // Reset form
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
    <form onSubmit={handleSubmit} style={{ maxWidth: '480px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Form Pencatatan Kas Desa</h3>
      
      {errorMsg && <div style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>{errorMsg}</div>}

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Jenis Transaksi:</label>
        <select value={type} onChange={(e) => setType(e.target.value as 'masuk' | 'keluar')} style={{ width: '100%', padding: '8px' }}>
          <option value="masuk">Uang Masuk (Iuran / Setoran)</option>
          <option value="keluar">Uang Keluar (Belanja / Pengeluaran)</option>
        </select>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Nominal (Rp):</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="Contoh: 50000" 
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          {type === 'masuk' ? 'Atas Nama (Warga / Donatur):' : 'Untuk Keperluan Apa (Deskripsi):'}
        </label>
        <input 
          type="text" 
          value={nameOrDesc} 
          onChange={(e) => setNameOrDesc(e.target.value)} 
          placeholder={type === 'masuk' ? 'Nama lengkap / RT' : 'Misal: Beli lampu jalan'} 
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Upload Bukti (Foto Transfer / Nota):</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => e.target.files && setFile(e.target.files[0])} 
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        {loading ? 'Mengunggah & Menyimpan...' : 'Kirim Transaksi'}
      </button>
    </form>
  );
}
