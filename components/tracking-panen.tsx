'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import ModalForm from './modal-form';
import { parseISO, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useToast } from '@/lib/use-toast';
import { usePagination } from '@/lib/use-pagination';

const formatIDR = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'd MMM yyyy', { locale: id });
  } catch {
    return dateString;
  }
};

export default function TrackingPanen() {
  const { harvests, addHarvest, updateHarvest, deleteHarvest } = useAppStore();
  const { toast } = useToast();
  const pagination = usePagination(harvests.length, 10);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    cropName: '',
    kg: 0,
    pricePerKg: 0,
    nominalValue: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleOpenModal = () => {
    setEditIndex(null);
    setFormData({
      cropName: '',
      kg: 0,
      pricePerKg: 0,
      nominalValue: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowModal(true);
  };

  const handleEditItem = (index: number) => {
    const harvest = harvests[index];
    setEditIndex(index);
    setFormData({
      cropName: harvest.cropName,
      kg: harvest.kg,
      pricePerKg: harvest.pricePerKg,
      nominalValue: harvest.nominalValue,
      date: harvest.date,
      notes: harvest.notes,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.cropName || formData.kg <= 0 || formData.nominalValue <= 0) return;

    if (editIndex !== null) {
      updateHarvest(editIndex, formData);
    } else {
      addHarvest(formData);
    }
    setShowModal(false);
  };

  const handleDelete = (index: number) => {
    const harvest = harvests[index];
    toast({
      title: 'Konfirmasi Hapus',
      description: `Hapus panen "${harvest.cropName}" (${harvest.kg}kg)?`,
      action: (
        <button
          onClick={() => deleteHarvest(index)}
          className="text-red-600 font-bold text-xs"
        >
          Hapus
        </button>
      ),
    });
  };

  const totalKg = harvests.reduce((acc, curr) => acc + curr.kg, 0);
  const totalNominal = harvests.reduce((acc, curr) => acc + curr.nominalValue, 0);

  // Group harvests by crop name
  const cropCategories = harvests.reduce(
    (acc, curr) => {
      const existing = acc.find((cat) => cat.cropName === curr.cropName);
      if (existing) {
        existing.totalKg += curr.kg;
        existing.totalNominal += curr.nominalValue;
        existing.count += 1;
      } else {
        acc.push({
          cropName: curr.cropName,
          totalKg: curr.kg,
          totalNominal: curr.nominalValue,
          count: 1,
        });
      }
      return acc;
    },
    [] as Array<{ cropName: string; totalKg: number; totalNominal: number; count: number }>
  );

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
          Tracking Panen
        </h2>
        <p className="text-[10px] text-gray-400 mt-1">Kelola data hasil panen dalam kg dan nominal</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <p className="text-[9px] font-black text-green-600 uppercase">Total Kg</p>
          <p className="text-lg font-bold text-green-700 mt-2">{totalKg.toLocaleString('id-ID')} kg</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <p className="text-[9px] font-black text-blue-600 uppercase">Total Nominal</p>
          <p className="text-lg font-bold text-blue-700 mt-2">{formatIDR(totalNominal)}</p>
        </div>
      </div>

      {/* Crop Categories */}
      {cropCategories.length > 0 && (
        <div>
          <h3 className="text-[9px] font-black text-gray-600 uppercase mb-3">Kategori Tanaman</h3>
          <div className="grid grid-cols-2 gap-2">
            {cropCategories.map((category) => (
              <div
                key={category.cropName}
                className="bg-white border border-green-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-xs font-bold text-gray-700 truncate">{category.cropName}</p>
                <div className="flex justify-between items-start mt-2">
                  <div>
                    <p className="text-[8px] text-gray-500 uppercase font-bold">Total</p>
                    <p className="text-sm font-bold text-green-600 mt-0.5">
                      {category.totalKg.toLocaleString('id-ID')} kg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-gray-500 uppercase font-bold">Panen</p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">{category.count}x</p>
                  </div>
                </div>
                <p className="text-[8px] text-gray-400 mt-2">{formatIDR(category.totalNominal)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={handleOpenModal}
        className="w-full bg-green-600 text-white p-4 rounded-2xl font-bold text-sm shadow-lg shadow-green-200 hover:bg-green-700 transition-all active:scale-95"
      >
        + Tambah Panen
      </button>

      {/* Data List */}
      <div className="space-y-2">
        {harvests.slice(pagination.startIndex, pagination.endIndex).map((harvest, idx) => {
          const index = pagination.startIndex + idx;
          return (
          <div
            key={index}
            className="bg-white border rounded-lg p-4 flex justify-between items-start gap-3"
          >
          <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-700">{harvest.cropName}</p>
              <div className="flex gap-2 text-[9px] text-gray-400 font-bold uppercase mt-1">
                <span>{harvest.kg.toLocaleString('id-ID')} kg</span>
                <span>•</span>
                <span>{formatIDR(harvest.pricePerKg)}/kg</span>
                <span>•</span>
                <span>{formatDate(harvest.date)}</span>
              </div>
              {harvest.notes && (
                <p className="text-[9px] text-gray-500 mt-1 italic">{harvest.notes}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="font-mono text-sm font-bold text-green-600">
                {formatIDR(harvest.nominalValue)}
              </p>
              <div className="flex gap-1">
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
          );
        })}
        {harvests.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Belum ada data panen tercatat</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {harvests.length > 10 && (
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

      {/* Modal Form */}
      <ModalForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        modalType="panen"
        isEditing={editIndex !== null}
      />
    </div>
  );
}
