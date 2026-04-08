'use client';

import { Dispatch, SetStateAction } from 'react';

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  formData: any;
  setFormData: Dispatch<SetStateAction<any>>;
  modalType: 'log' | 'finance' | 'utang_piutang';
  isEditing: boolean;
}

export default function ModalForm({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  modalType,
  isEditing,
}: ModalFormProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transition-all translate-y-0">
        <h3 className="font-black text-lg mb-4 text-gray-800">
          {isEditing ? 'Perbarui Data' : 'Tambah Baru'}
        </h3>

        {modalType === 'log' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Kegiatan</label>
              <input
                type="text"
                placeholder="Kegiatan..."
                value={formData.activity}
                onChange={(e) =>
                  setFormData({ ...formData, activity: e.target.value })
                }
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 ring-green-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 ring-green-500"
              >
                <option value="Lahan">Persiapan Lahan</option>
                <option value="Pemupukan">Pemupukan / Kompos</option>
                <option value="Perawatan">Penyiraman/Pruning</option>
                <option value="Hama">Pestisida Organik</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Tanggal</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 ring-green-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Catatan Tambahan</label>
              <textarea
                placeholder="Catatan tambahan..."
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                className="w-full bg-gray-50 border p-3 rounded-xl h-24 outline-none focus:ring-2 ring-green-500 resize-none"
              />
            </div>
          </div>
        )}

        {modalType === 'finance' && (
          <div className="space-y-4">
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setFormData({ ...formData, type: 'out' })}
                className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
                  formData.type === 'out'
                    ? 'bg-white shadow text-red-600'
                    : 'text-gray-400'
                }`}
              >
                Keluar
              </button>
              <button
                onClick={() => setFormData({ ...formData, type: 'in' })}
                className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
                  formData.type === 'in'
                    ? 'bg-white shadow text-green-600'
                    : 'text-gray-400'
                }`}
              >
                Masuk
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Nama Barang / Hasil</label>
              <input
                type="text"
                placeholder="Nama Barang / Hasil..."
                value={formData.item}
                onChange={(e) =>
                  setFormData({ ...formData, item: e.target.value })
                }
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Nominal Rp</label>
              <input
                type="number"
                placeholder="Nominal Rp"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Tanggal</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500"
              />
            </div>
          </div>
        )}

        {modalType === 'utang_piutang' && (
          <div className="space-y-4">
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setFormData({ ...formData, type: 'utang' })}
                className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
                  formData.type === 'utang'
                    ? 'bg-white shadow text-red-600'
                    : 'text-gray-400'
                }`}
              >
                Utang
              </button>
              <button
                onClick={() => setFormData({ ...formData, type: 'piutang' })}
                className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
                  formData.type === 'piutang'
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-400'
                }`}
              >
                Piutang
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Deskripsi Transaksi</label>
              <input
                type="text"
                placeholder="Deskripsi transaksi..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 ring-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Nama Pihak (Pemberi/Penerima)</label>
              <input
                type="text"
                placeholder="Nama pihak..."
                value={formData.party}
                onChange={(e) =>
                  setFormData({ ...formData, party: e.target.value })
                }
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 ring-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Nominal Rp</label>
              <input
                type="number"
                placeholder="Nominal Rp"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 ring-purple-500"
              />
            </div>
            {isEditing && (
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-2">Sudah Dibayar/Diterima (Rp)</label>
                <input
                  type="number"
                  placeholder="Jumlah yang sudah dibayar/diterima..."
                  value={formData.paid || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, paid: Math.min(parseFloat(e.target.value) || 0, formData.amount) })
                  }
                  className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 ring-purple-500"
                />
                <p className="text-[9px] text-gray-400 mt-1">Sisa: {formData.amount - (formData.paid || 0)}</p>
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Tanggal</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-2 ring-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Status</label>
              <div className="flex p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setFormData({ ...formData, status: 'belum_lunas' })}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
                    formData.status === 'belum_lunas'
                      ? 'bg-white shadow text-yellow-600'
                      : 'text-gray-400'
                  }`}
                >
                  Belum Lunas
                </button>
                <button
                  onClick={() => setFormData({ ...formData, status: 'lunas' })}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
                    formData.status === 'lunas'
                      ? 'bg-white shadow text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  Lunas
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-sm font-bold text-gray-400 uppercase hover:text-gray-600"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm uppercase shadow-lg shadow-gray-200 hover:bg-gray-800 transition-colors"
          >
            {isEditing ? 'Simpan Perubahan' : 'Tambah Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}
