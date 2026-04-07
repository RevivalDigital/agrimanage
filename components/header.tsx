'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export default function Header() {
  const { balance } = useAppStore();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    );
  }, []);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <header className="bg-green-700 text-white p-5 sticky top-0 z-10 shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold italic tracking-tighter">
            AgriManage <span className="font-light text-green-300 underline">Pro</span>
          </h1>
          <p className="text-[10px] opacity-80 uppercase mt-1">{currentDate}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase opacity-70">Saldo Kas</p>
          <p className="text-lg font-mono font-bold">{formatIDR(balance)}</p>
        </div>
      </div>
    </header>
  );
}
