'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import ModalForm from './modal-form';
import { parseISO, format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function UtangPiutang() {
  const { utangPiutang, addUtangPiutang, updateUtangPiutang, deleteUtangPiutang } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
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
        {utangPiutang.map((item, index) => (
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
              <div>
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
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditItem(index)}
                  className="text-blue-400 hover:text-blue-500 text-[9px] font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteUtangPiutang(index)}
                  className="text-red-300 hover:text-red-400 text-[9px] font-bold"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
        {utangPiutang.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Belum ada data utang atau piutang</p>
          </div>
        )}
      </div>

      <ModalForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        modalType="utang_piutang"
        isEditing={editIndex !== null}
      />
    </div>
  );
}
