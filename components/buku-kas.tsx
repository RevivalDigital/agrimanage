'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import ModalForm from './modal-form';
import { parseISO, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useToast } from '@/lib/use-toast';
import { usePagination } from '@/lib/use-pagination';

export default function BukuKas() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useAppStore();
  const { toast } = useToast();
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pagination = usePagination(sortedTransactions.length, 10);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    item: '',
    amount: 0,
    type: 'out' as 'in' | 'out',
    date: new Date().toISOString().split('T')[0],
  });

  const handleOpenModal = () => {
    setEditIndex(null);
    setFormData({
      item: '',
      amount: 0,
      type: 'out',
      date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleEditItem = (index: number) => {
    setEditIndex(index);
    setFormData({ ...transactions[index] });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.item || formData.amount <= 0) return;

    if (editIndex !== null) {
      updateTransaction(editIndex, formData);
    } else {
      addTransaction(formData);
    }
    setShowModal(false);
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'd MMM yyyy', { locale: id });
    } catch {
      return dateString;
    }
  };

  const handleDelete = (index: number) => {
    const trx = transactions[index];
    toast({
      title: 'Konfirmasi Hapus',
      description: `Hapus transaksi "${trx.item}"?`,
      action: (
        <button
          onClick={() => deleteTransaction(index)}
          className="text-red-600 font-bold text-xs"
        >
          Hapus
        </button>
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-black text-gray-400 uppercase">Buku Kas Tanaman</h2>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md hover:bg-blue-700 transition-colors"
        >
          + Transaksi
        </button>
      </div>

      <div className="space-y-2">
        {sortedTransactions.slice(pagination.startIndex, pagination.endIndex).map((trx, idx) => {
          const index = transactions.indexOf(trx);
          return (
          <div
            key={index}
            className="bg-white border rounded-lg p-3 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-[9px] ${
                  trx.type === 'in'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {trx.type === 'in' ? 'IN' : 'OUT'}
              </div>
              <div>
                <p className="text-sm font-bold">{trx.item}</p>
                <div className="flex gap-2 text-[9px] text-gray-400 font-bold uppercase">
                  <span>{formatDate(trx.date)}</span>
                  <button
                    onClick={() => handleEditItem(index)}
                    className="text-blue-400 hover:text-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-300 hover:text-red-400"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
            <p
              className={`font-mono text-sm font-bold ${
                trx.type === 'in' ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {trx.type === 'out' ? '-' : '+'} {formatIDR(trx.amount)}
            </p>
          </div>
          );
        })}
        {sortedTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Belum ada transaksi tercatat</p>
          </div>
        )}
      </div>

      {sortedTransactions.length > 10 && (
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
        modalType="finance"
        isEditing={editIndex !== null}
      />
    </div>
  );
}
