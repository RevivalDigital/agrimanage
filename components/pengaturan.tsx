'use client';

import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Pengaturan() {
  const { logs, transactions, clearAllData } = useAppStore();

  const generateBackupName = () => {
    const now = new Date();
    const timeString = format(now, 'HH-mm-ss', { locale: id });
    const dateString = format(now, 'd-MMMM-yyyy', { locale: id });
    return `backup_agri_${timeString}_${dateString}`;
  };

  const handleExport = () => {
    const data = { logs, transactions };
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

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result as string);
        if (
          confirm(
            'Timpa data saat ini dengan data cadangan?\nTindakan ini tidak bisa dibatalkan!'
          )
        ) {
          const { logs: importedLogs, transactions: importedTrx } = imported;
          if (importedLogs && importedTrx) {
            // Manually set the data (you might need to add a setData method to store)
            localStorage.setItem('agri_logs_v3', JSON.stringify(importedLogs || []));
            localStorage.setItem(
              'agri_transactions_v3',
              JSON.stringify(importedTrx || [])
            );
            alert('Berhasil memulihkan data!');
            window.location.reload();
          } else {
            alert('Format file tidak valid.');
          }
        }
      } catch (err) {
        alert('File tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleWipe = () => {
    if (
      confirm(
        'PERINGATAN: Semua data akan dihapus.\nTindakan ini tidak bisa dibatalkan!'
      )
    ) {
      if (confirm('Yakin benar-benar ingin menghapus SEMUA?')) {
        clearAllData();
        alert('Data telah dikosongkan.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xs font-black text-gray-400 uppercase italic">
        Manajemen Data & Backup
      </h2>

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={handleExport}
          className="w-full bg-gray-800 text-white p-4 rounded-xl text-sm font-bold flex justify-between items-center hover:bg-gray-700 transition-colors shadow-md"
        >
          <span>Salin Cadangan (Backup)</span>
          <span className="text-[10px] bg-gray-700 px-2 py-1 rounded">JSON</span>
        </button>

        <label className="w-full bg-blue-50 border-2 border-blue-100 text-blue-700 p-4 rounded-xl text-sm font-bold flex justify-between items-center cursor-pointer hover:bg-blue-100 transition-colors">
          <span>Pulihkan Data (Restore)</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <span className="text-[10px] bg-blue-200 px-2 py-1 rounded text-blue-800 uppercase">
            Upload
          </span>
        </label>

        <button
          onClick={handleWipe}
          className="w-full bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-xl text-sm font-bold flex justify-between items-center hover:bg-red-100 transition-colors"
        >
          <span>Hapus Semua Data</span>
          <span className="text-[10px] bg-red-500 text-white px-2 py-1 rounded uppercase font-black">
            Bahaya!
          </span>
        </button>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-[10px] text-gray-400 text-center">
          AgriManage Pro v1.0<br/>
          Sistem Manajemen Lahan Pertanian Terpadu
        </p>
      </div>
    </div>
  );
}
