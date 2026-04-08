'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import ModalForm from './modal-form';
import PaymentModal from './payment-modal';
import { parseISO, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useToast } from '@/lib/use-toast';
import { usePagination } from '@/lib/use-pagination';

export default function UtangPiutang() {
  const { utangPiutang, addUtangPiutang, updateUtangPiutang, deleteUtangPiutang } = useAppStore();
  const { toast } = useToast();
  const pagination = usePagination(utangPiutang.length, 10);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentIndex, setPaymentIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    paid: 0,
    type: 'utang' as 'utang' | 'piutang',
    party: '',
    date: new Date().toISOString().split('T')[0],
    status: 'belum_lunas' as 'lunas' | 'belum_lunas',
  });

  const handleOpenModal = () => {
    setEditIndex(null);
    setFormData({
      description: '',
      amount: 0,
      paid: 0,
      type: 'utang',
      party: '',
      date: new Date().toISOString().split('T')[0],
      status: 'belum_lunas',
    });
    setShowModal(true);
  };

  const handleEditItem = (index: number) => {
    setEditIndex(index);
    setFormData({ ...utangPiutang[index] });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.description || !formData.party || formData.amount <= 0) return;

    if (editIndex !== null) {
      updateUtangPiutang(editIndex, formData);
    } else {
      addUtangPiutang(formData);
    }
    setShowModal(false);
  };

  const handleDelete = (index: number) => {
    const item = utangPiutang[index];
    toast({
      title: 'Konfirmasi Hapus',
      description: `Hapus "${item.description}" dari ${item.party}?`,
      action: (
        <button
          onClick={() => deleteUtangPiutang(index)}
          className="text-red-600 font-bold text-xs"
        >
          Hapus
        </button>
      ),
    });
  };

  const handleOpenPaymentModal = (index: number) => {
    setPaymentIndex(index);
    setShowPaymentModal(true);
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

  const totalUtang = utangPiutang
    .filter((item) => item.type === 'utang')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPiutang = utangPiutang
    .filter((item) => item.type === 'piutang')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-black text-gray-400 uppercase">Utang & Piutang</h2>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md hover:bg-blue-700 transition-colors"
        >
          + Catat
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-[9px] font-black text-red-600 uppercase">Total Utang</p>
          <p className="text-sm font-bold text-red-700 mt-1">{formatIDR(totalUtang)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-[9px] font-black text-blue-600 uppercase">Total Piutang</p>
          <p className="text-sm font-bold text-blue-700 mt-1">{formatIDR(totalPiutang)}</p>
        </div>
      </div>

      <div className="space-y-2">
        {utangPiutang.slice(pagination.startIndex, pagination.endIndex).map((item, idx) => {
          const index = pagination.startIndex + idx;
          <div
            key={index}
            className="bg-white border rounded-lg p-3 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-[9px] ${
                  item.type === 'utang'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {item.type === 'utang' ? 'UT' : 'PT'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{item.description}</p>
                <div className="flex gap-2 text-[9px] text-gray-400 font-bold uppercase">
                  <span>{item.party}</span>
                  <span>•</span>
                  <span>{formatDate(item.date)}</span>
                </div>
                <div className="flex gap-2 text-[9px] mt-1">
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      item.status === 'lunas'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {item.status === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                  </span>
                </div>
                {item.paid > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          item.status === 'lunas'
                            ? 'bg-green-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${(item.paid / item.amount) * 100}%` }}
                      />
                    </div>
                    <p className="text-[8px] text-gray-400 mt-1">
                      {formatIDR(item.paid)} / {formatIDR(item.amount)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p
                className={`font-mono text-sm font-bold ${
                  item.type === 'utang' ? 'text-red-600' : 'text-blue-600'
                }`}
              >
                {formatIDR(item.amount)}
              </p>
              <div className="flex gap-1 flex-wrap justify-end">
                {item.status === 'belum_lunas' && (
                  <button
                    onClick={() => handleOpenPaymentModal(index)}
                    className="text-purple-500 hover:text-purple-600 text-[9px] font-bold"
                  >
                    {item.type === 'utang' ? 'Bayar' : 'Terima'}
                  </button>
                )}
                <button
                  onClick={() => handleEditItem(index)}
                  className="text-blue-400 hover:text-blue-500 text-[9px] font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-300 hover:text-red-400 text-[9px] font-bold"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        })}
        {utangPiutang.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Belum ada data utang atau piutang</p>
          </div>
        )}
      </div>

      {utangPiutang.length > 10 && (
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
        modalType="utang_piutang"
        isEditing={editIndex !== null}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentIndex(null);
        }}
        itemIndex={paymentIndex || 0}
      />
    </div>
  );
}
