'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import ModalForm from './modal-form';
import DeleteDialog from './delete-dialog';
import { parseISO, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { usePagination } from '@/lib/use-pagination';

export default function BukuKas() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useAppStore();
  const { toast } = useToast();
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pagination = usePagination(sortedTransactions.length, 10);
  const [showModal, setShowModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; index: number | null }>({
    isOpen: false,
    index: null,
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    item: '',
    amount: 0,
    type: 'out' as 'in' | 'out',
    category: undefined as any,
    categoryName: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleOpenModal = () => {
    setEditIndex(null);
    setFormData({
      item: '',
      amount: 0,
      type: 'out',
      category: undefined,
      categoryName: '',
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
    setDeleteDialog({ isOpen: true, index });
  };

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'in').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'out').reduce((acc, curr) => acc + curr.amount, 0);

  // Group expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'out')
    .reduce((acc, curr) => {
      const cat = curr.category || 'lainnya';
      const existing = acc.find(c => c.category === cat);
      if (existing) {
        existing.amount += curr.amount;
      } else {
        acc.push({ category: cat, amount: curr.amount, count: 1 });
      }
      return acc;
    }, [] as Array<{ category: string; amount: number; count: number }>);

  // Group income by type
  const incomeByType = transactions
    .filter(t => t.type === 'in')
    .reduce((acc, curr) => {
      const catName = (curr as any).categoryName || 'Pemasukan Lainnya';
      const existing = acc.find(c => c.name === catName);
      if (existing) {
        existing.amount += curr.amount;
      } else {
        acc.push({ name: catName, amount: curr.amount, count: 1 });
      }
      return acc;
    }, [] as Array<{ name: string; amount: number; count: number }>);

  const categoryLabels: Record<string, string> = {
    ongkos_pekerja: 'Ongkos Pekerja',
    pestisida: 'Pestisida',
    pupuk: 'Pupuk',
    lainnya: 'Lainnya',
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

      {/* Summary Cards - Pemasukan dan Pengeluaran */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <p className="text-[9px] font-black text-green-600 uppercase">Total Pemasukan</p>
          <p className="text-lg font-bold text-green-700 mt-2">{formatIDR(totalIncome)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
          <p className="text-[9px] font-black text-red-600 uppercase">Total Pengeluaran</p>
          <p className="text-lg font-bold text-red-700 mt-2">{formatIDR(totalExpense)}</p>
        </div>
      </div>

      {/* Pemasukan Per Kategori */}
      {incomeByType.length > 0 && (
        <div>
          <h3 className="text-[9px] font-bold text-gray-600 uppercase mb-2">Pemasukan per Jenis</h3>
          <div className="grid grid-cols-2 gap-2">
            {incomeByType.map((item) => (
              <div key={item.name} className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
                <p className="text-[9px] font-bold text-green-700 truncate">{item.name}</p>
                <p className="text-sm font-bold text-green-600 mt-1">{formatIDR(item.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pengeluaran Per Kategori */}
      {expensesByCategory.length > 0 && (
        <div>
          <h3 className="text-[9px] font-bold text-gray-600 uppercase mb-2">Pengeluaran per Kategori</h3>
          <div className="grid grid-cols-2 gap-2">
            {expensesByCategory.map((item) => (
              <div key={item.category} className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-3">
                <p className="text-[9px] font-bold text-red-700">{categoryLabels[item.category] || item.category}</p>
                <p className="text-sm font-bold text-red-600 mt-1">{formatIDR(item.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        title="Hapus Transaksi"
        description={
          deleteDialog.index !== null
            ? `Hapus transaksi "${transactions[deleteDialog.index]?.item}"?`
            : ''
        }
        itemName={deleteDialog.index !== null ? transactions[deleteDialog.index]?.item || '' : ''}
        onConfirm={() => deleteDialog.index !== null && deleteTransaction(deleteDialog.index)}
        onCancel={() => setDeleteDialog({ isOpen: false, index: null })}
      />
    </div>
  );
}
