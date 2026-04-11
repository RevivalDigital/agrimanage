'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import ModalForm from './modal-form';
import DeleteDialog from './delete-dialog';
import { isFuture, parseISO, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { usePagination } from '@/lib/use-pagination';

export default function LogAktivitas() {
  const { logs, addLog, updateLog, deleteLog } = useAppStore();
  const { toast } = useToast();
  // Sort logs by date (newest first)
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pagination = usePagination(sortedLogs.length, 10);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; index: number | null }>({
    isOpen: false,
    index: null,
  });
  const [formData, setFormData] = useState({
    activity: '',
    category: 'Lahan',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleOpenModal = () => {
    setEditIndex(null);
    setFormData({
      activity: '',
      category: 'Lahan',
      note: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleEditItem = (index: number) => {
    setEditIndex(index);
    setFormData({ ...logs[index] });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.activity) return;

    if (editIndex !== null) {
      updateLog(editIndex, formData);
    } else {
      addLog(formData);
    }
    setShowModal(false);
  };

  const isTodo = (dateString: string) => {
    try {
      return isFuture(parseISO(dateString));
    } catch {
      return false;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'd MMM yyyy', { locale: id });
    } catch {
      return dateString;
    }
  };

  const handleDelete = (index: number) => {
    setDeleteDialog({ isOpen: true, index });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-black text-gray-400 uppercase">Log Aktivitas Lahan</h2>
        <button
          onClick={handleOpenModal}
          className="bg-green-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md hover:bg-green-700 transition-colors"
        >
          + Aktivitas
        </button>
      </div>

      <div className="space-y-3">
        {sortedLogs.slice(pagination.startIndex, pagination.endIndex).map((log, idx) => {
          const index = logs.indexOf(log);
          return (
          <div key={index} className="bg-white border rounded-xl p-4 shadow-sm relative group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-green-600 uppercase">
                  {log.category}
                </span>
                {isTodo(log.date) && (
                  <span className="text-[8px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded uppercase">
                    TODO
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditItem(index)}
                  className="text-blue-500 text-[10px] font-bold uppercase hover:text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-400 text-[10px] font-bold uppercase hover:text-red-500"
                >
                  Hapus
                </button>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-800">{log.activity}</p>
            {log.note && <p className="text-xs text-gray-500 mt-1">{log.note}</p>}
            <p className="text-[9px] text-gray-300 mt-2">{formatDate(log.date)}</p>
          </div>
          );
        })}
        {sortedLogs.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Belum ada aktivitas tercatat</p>
          </div>
        )}
      </div>

      {sortedLogs.length > 10 && (
        <div className="flex items-center justify-between gap-2 bg-white border rounded-lg p-3">
          <button
            onClick={pagination.prevPage}
            disabled={pagination.currentPage === 1}
            className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            ← Sebelumnya
          </button>
          <span className="text-xs font-bold text-gray-500">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            onClick={pagination.nextPage}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            Selanjutnya →
          </button>
        </div>
      )}

      <ModalForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        modalType="log"
        isEditing={editIndex !== null}
      />

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        title="Hapus Aktivitas"
        description={
          deleteDialog.index !== null
            ? `Hapus aktivitas "${logs[deleteDialog.index]?.activity}"?`
            : ''
        }
        itemName={deleteDialog.index !== null ? logs[deleteDialog.index]?.activity || '' : ''}
        onConfirm={() => deleteDialog.index !== null && deleteLog(deleteDialog.index)}
        onCancel={() => setDeleteDialog({ isOpen: false, index: null })}
      />
    </div>
  );
}
