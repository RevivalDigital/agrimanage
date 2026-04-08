'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/lib/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemIndex: number;
}

export default function PaymentModal({
  isOpen,
  onClose,
  itemIndex,
}: PaymentModalProps) {
  const { utangPiutang, payPartialUtangPiutang } = useAppStore();
  const { toast } = useToast();
  const [amount, setAmount] = useState(0);

  if (!isOpen || !utangPiutang[itemIndex]) return null;

  const item = utangPiutang[itemIndex];
  const remaining = item.amount - item.paid;

  const handlePayment = () => {
    if (amount <= 0) return;
    if (amount > remaining) {
      toast({
        title: 'Jumlah Melebihi',
        description: `Jumlah pembayaran tidak boleh melebihi Rp ${remaining.toLocaleString('id-ID')}`,
      });
      return;
    }

    payPartialUtangPiutang(itemIndex, amount);
    toast({
      title: 'Pembayaran Berhasil',
      description: `${item.type === 'utang' ? 'Bayar' : 'Terima'} Rp ${amount.toLocaleString('id-ID')}`,
    });
    setAmount(0);
    onClose();
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transition-all translate-y-0">
        <h3 className="font-black text-lg mb-4 text-gray-800">
          {item.type === 'utang' ? 'Bayar Utang' : 'Terima Piutang'}
        </h3>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-[9px] font-bold text-gray-600 uppercase">Deskripsi</p>
            <p className="text-sm font-bold text-gray-800 mt-1">{item.description}</p>
            <p className="text-[9px] text-gray-400 mt-2">dari {item.party}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-[8px] font-bold text-red-600 uppercase">Total</p>
              <p className="text-xs font-bold text-red-700 mt-1">{formatIDR(item.amount)}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-[8px] font-bold text-yellow-600 uppercase">Sudah {item.type === 'utang' ? 'Bayar' : 'Terima'}</p>
              <p className="text-xs font-bold text-yellow-700 mt-1">{formatIDR(item.paid)}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-[8px] font-bold text-blue-600 uppercase">Sisa</p>
              <p className="text-xs font-bold text-blue-700 mt-1">{formatIDR(remaining)}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-2">
              Jumlah {item.type === 'utang' ? 'Bayar' : 'Terima'} (Rp)
            </label>
            <input
              type="number"
              placeholder={`Maksimal ${remaining.toLocaleString('id-ID')}`}
              value={amount}
              onChange={(e) => setAmount(Math.min(parseFloat(e.target.value) || 0, remaining))}
              className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 ring-purple-500"
            />
          </div>

          {amount > 0 && (
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-[9px] font-bold text-purple-600 uppercase">Sisa Setelah Pembayaran</p>
              <p className="text-sm font-bold text-purple-700 mt-1">{formatIDR(remaining - amount)}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-sm font-bold text-gray-400 uppercase hover:text-gray-600"
          >
            Batal
          </button>
          <button
            onClick={handlePayment}
            disabled={amount <= 0}
            className="flex-[2] bg-purple-600 text-white py-4 rounded-2xl font-bold text-sm uppercase shadow-lg shadow-purple-200 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {item.type === 'utang' ? 'Bayar Sekarang' : 'Konfirmasi Terima'}
          </button>
        </div>
      </div>
    </div>
  );
}
