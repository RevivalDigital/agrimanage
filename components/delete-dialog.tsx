'use client';

import { useState } from 'react';
import { useToast } from '@/lib/use-toast';

interface DeleteDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteDialog({
  isOpen,
  title,
  description,
  itemName,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      onConfirm();
      toast({
        title: 'Berhasil Dihapus',
        description: `${itemName} telah berhasil dihapus.`,
      });
      onCancel();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-xs text-red-700 font-bold">
            Tindakan ini tidak dapat dibatalkan
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}
