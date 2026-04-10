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
  // Sort utang piutang by date (newest first)
  const sortedUtangPiutang = [...utangPiutang].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pagination = usePagination(sortedUtangPiutang.length, 10);

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

  // --- HANDLERS ---

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

    // Sinkronisasi status otomatis saat simpan/edit manual
    const finalData = {
      ...formData,
      status: formData.paid >= formData.amount ? 'lunas' : 'belum_lunas'
    };

    if (editIndex !== null) {
      updateUtangPiutang(editIndex, finalData as any);
    } else {
      addUtangPiutang(finalData as any);
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

  // --- UTILS ---

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

  // Hitung sisa saldo (Bukan total kotor)
  const totalUtangNet = utangPiutang
    .filter((item) => item.type === 'utang')
    .reduce((acc, curr) => acc + (curr.amount - curr.paid), 0);

  const totalPiutangNet = utangPiutang
    .filter((item) => item.type === 'piutang')
    .reduce((acc, curr) => acc + (curr.amount - curr.paid), 0);

  // Group by party - only belum lunas
  const utangByParty = utangPiutang
    .filter((item) => item.type === 'utang' && item.status === 'belum_lunas')
    .reduce((acc, curr) => {
      const existing = acc.find((p) => p.party === curr.party);
      if (existing) {
        existing.total += curr.amount - curr.paid;
      } else {
        acc.push({ party: curr.party, total: curr.amount - curr.paid });
      }
      return acc;
    }, [] as Array<{ party: string; total: number }>);

  const piutangByParty = utangPiutang
    .filter((item) => item.type === 'piutang' && item.status === 'belum_lunas')
    .reduce((acc, curr) => {
      const existing = acc.find((p) => p.party === curr.party);
      if (existing) {
        existing.total += curr.amount - curr.paid;
      } else {
        acc.push({ party: curr.party, total: curr.amount - curr.paid });
      }
      return acc;
    }, [] as Array<{ party: string; total: number }>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Utang & Piutang</h2>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          + Catat Baru
        </button>
      </div>

      {/* Ringkasan Dashboard */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 shadow-sm">
          <p className="text-[9px] font-black text-red-500 uppercase">Sisa Utang</p>
          <p className="text-sm font-bold text-red-700 mt-1">{formatIDR(totalUtangNet)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 shadow-sm">
          <p className="text-[9px] font-black text-blue-500 uppercase">Sisa Piutang</p>
          <p className="text-sm font-bold text-blue-700 mt-1">{formatIDR(totalPiutangNet)}</p>
        </div>
      </div>

      {/* Utang per Pemberi - Hanya yang Belum Lunas */}
      {utangByParty.length > 0 && (
        <div>
          <h3 className="text-[9px] font-bold text-gray-600 uppercase mb-2">Utang per Pemberi</h3>
          <div className="grid grid-cols-2 gap-2">
            {utangByParty.map((item) => (
              <div
                key={item.party}
                className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-3 shadow-sm"
              >
                <p className="text-[9px] font-bold text-red-700 truncate">{item.party}</p>
                <p className="text-sm font-bold text-red-600 mt-1">{formatIDR(item.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Piutang per Penerima - Hanya yang Belum Lunas */}
      {piutangByParty.length > 0 && (
        <div>
          <h3 className="text-[9px] font-bold text-gray-600 uppercase mb-2">Piutang per Penerima</h3>
          <div className="grid grid-cols-2 gap-2">
            {piutangByParty.map((item) => (
              <div
                key={item.party}
                className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 shadow-sm"
              >
                <p className="text-[9px] font-bold text-blue-700 truncate">{item.party}</p>
                <p className="text-sm font-bold text-blue-600 mt-1">{formatIDR(item.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List Item */}
      <div className="space-y-2">
        {sortedUtangPiutang.slice(pagination.startIndex, pagination.endIndex).map((item, idx) => {
          const actualIndex = utangPiutang.indexOf(item);
          const remaining = item.amount - item.paid;
          const progress = Math.min((item.paid / item.amount) * 100, 100);

          return (
            <div
              key={actualIndex}
              className={`bg-white border rounded-xl p-3 shadow-sm flex items-center justify-between border-l-4 ${item.type === 'utang' ? 'border-l-red-500' : 'border-l-blue-500'
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full font-black text-[10px] ${item.type === 'utang' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}
                >
                  {item.type === 'utang' ? 'UT' : 'PT'}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{item.description}</p>
                  <div className="flex gap-2 text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                    <span>{item.party}</span>
                    <span>•</span>
                    <span>{formatDate(item.date)}</span>
                  </div>

                  {/* Progress Pembayaran */}
                  <div className="mt-2 w-32">
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${item.status === 'lunas' ? 'bg-green-500' : 'bg-yellow-400'
                          }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {item.paid > 0 && (
                      <p className="text-[7px] text-gray-400 mt-1 font-bold">
                        DIBAYAR: {formatIDR(item.paid)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className={`font-mono text-sm font-bold ${item.type === 'utang' ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatIDR(remaining)}
                  </p>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${item.status === 'lunas' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {item.status === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                  </span>
                </div>

                <div className="flex gap-2">
                  {item.status === 'belum_lunas' && (
                    <button
                      onClick={() => handleOpenPaymentModal(actualIndex)}
                      className="text-purple-600 hover:text-purple-800 text-[10px] font-bold"
                    >
                      {item.type === 'utang' ? 'Bayar' : 'Terima'}
                    </button>
                  )}
                  <button onClick={() => handleEditItem(actualIndex)} className="text-blue-500 text-[10px] font-bold">Edit</button>
                  <button onClick={() => handleDelete(actualIndex)} className="text-red-300 text-[10px] font-bold">Hapus</button>
                </div>
              </div>
            </div>
          );
        })}

        {sortedUtangPiutang.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Belum ada data utang atau piutang</p>
          </div>
        )}
      </div>

      {sortedUtangPiutang.length > 10 && (
        <div className="flex items-center justify-between bg-white border rounded-xl p-3 shadow-sm">
          <button
            onClick={pagination.prevPage}
            disabled={pagination.currentPage === 1}
            className="px-4 py-1.5 text-[10px] font-black uppercase bg-gray-50 text-gray-400 rounded-lg disabled:opacity-30 hover:bg-gray-100 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-[10px] font-black text-gray-400 tracking-widest">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            onClick={pagination.nextPage}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-1.5 text-[10px] font-black uppercase bg-gray-50 text-gray-400 rounded-lg disabled:opacity-30 hover:bg-gray-100 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modals */}
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
        itemIndex={paymentIndex ?? -1}
      />
    </div>
  );
}
