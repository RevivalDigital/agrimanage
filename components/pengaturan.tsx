'use client';

import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import React from 'react';

export default function Pengaturan() {
  const { logs, transactions, utangPiutang, clearAllData } = useAppStore();

  const generateBackupName = () => {
    const now = new Date();
    const timeString = format(now, 'HH-mm-ss', { locale: id });
    const dateString = format(now, 'd-MMMM-yyyy', { locale: id });
    return `backup_agri_${timeString}_${dateString}`;
  };

  /**
   * EXPORT DATA
   * Mengambil state saat ini dan mengunduhnya sebagai file JSON
   */
  const handleExport = () => {
    const data = { logs, transactions, utangPiutang };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generateBackupName()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * RESTORE DATA
   * Membaca file JSON dan memasukkannya ke dalam format Zustand Persist (agri-store, v3)
   */
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result as string);

        // 1. Validasi struktur dasar file
        if (!imported.logs || !imported.transactions || !imported.utangPiutang) {
          alert('Format file cadangan tidak valid atau tidak lengkap.');
          return;
        }

        if (confirm('PERINGATAN: Semua data saat ini akan diganti dengan data dari file cadangan. Lanjutkan?')) {

          // 2. Hitung ulang balance agar state konsisten
          const calculatedBalance = imported.transactions.reduce((acc: number, curr: any) => {
            return curr.type === 'out' ? acc - curr.amount : acc + curr.amount;
          }, 0);

          // 3. Bungkus ke format Zustand Persist (State Wrapper)
          // PENTING: Key 'state' dan 'version' harus sesuai dengan store.ts
          const zustandBackup = {
            state: {
              logs: imported.logs,
              transactions: imported.transactions,
              utangPiutang: imported.utangPiutang,
              balance: calculatedBalance
            },
            version: 3 // Harus sama dengan version: 3 di store.ts
          };

          // 4. Simpan ke LocalStorage menggunakan kunci utama store
          localStorage.setItem('agri-store', JSON.stringify(zustandBackup));

          alert('Data berhasil dipulihkan! Aplikasi akan dimuat ulang.');

          // 5. Hard reload untuk memuat state baru dari LocalStorage
          window.location.reload();
        }
      } catch (err) {
        console.error("Restore Error:", err);
        alert('Gagal memproses file. Pastikan file tersebut adalah file cadangan .json yang sah.');
      }
    };
    reader.readAsText(file);

    // Reset value agar input bisa digunakan kembali untuk file yang sama jika perlu
    event.target.value = '';
  };

  const handleWipe = () => {
    if (confirm('PERINGATAN: Seluruh data aplikasi akan dihapus permanen!\nPastikan Anda sudah memiliki backup.')) {
      if (confirm('Anda yakin benar-benar ingin mengosongkan semua data?')) {
        clearAllData();
        alert('Semua data telah dihapus.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest italic">
          Manajemen Data & Backup
        </h2>
        <p className="text-[10px] text-gray-400 mt-1">
          Amankan data pertanian Anda secara rutin.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {/* Tombol Export */}
        <button
          onClick={handleExport}
          className="w-full bg-gray-900 text-white p-4 rounded-2xl text-sm font-bold flex justify-between items-center hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-100"
        >
          <div className="flex flex-col items-start text-left">
            <span>Salin Cadangan (Backup)</span>
            <span className="text-[9px] font-medium text-gray-400 mt-0.5">Simpan data ke file .json</span>
          </div>
          <div className="bg-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tighter uppercase">
            Export
          </div>
        </button>

        {/* Tombol Import/Restore */}
        <label className="w-full bg-blue-50 border-2 border-blue-100 text-blue-700 p-4 rounded-2xl text-sm font-bold flex justify-between items-center cursor-pointer hover:bg-blue-100 transition-all active:scale-95">
          <div className="flex flex-col items-start text-left">
            <span>Pulihkan Data (Restore)</span>
            <span className="text-[9px] font-medium text-blue-400 mt-0.5">Upload file backup sebelumnya</span>
          </div>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tighter uppercase shadow-md shadow-blue-200">
            Upload
          </div>
        </label>

        {/* Tombol Wipe/Hapus */}
        <button
          onClick={handleWipe}
          className="w-full bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold flex justify-between items-center hover:bg-red-100 transition-all active:scale-95"
        >
          <div className="flex flex-col items-start text-left">
            <span>Hapus Semua Data</span>
            <span className="text-[9px] font-medium text-red-400 mt-0.5">Kosongkan state aplikasi</span>
          </div>
          <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tighter uppercase shadow-md shadow-red-200">
            Wipe
          </div>
        </button>
      </div>

      <footer className="mt-12 pt-6 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
          AgriManage Pro <span className="text-gray-200">v1.0</span>
        </p>
        <p className="text-[9px] text-gray-300 italic mt-1 font-medium">
          Integrated Farming Management System
        </p>
      </footer>
    </div>
  );
}