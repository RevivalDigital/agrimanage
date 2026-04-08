'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import Navigation from '@/components/navigation';
import LogAktivitas from '@/components/log-aktivitas';
import BukuKas from '@/components/buku-kas';
import UtangPiutang from '@/components/utang-piutang';
import Pengaturan from '@/components/pengaturan';

export default function Home() {
  const [tab, setTab] = useState<'perawatan' | 'akuntansi' | 'utang_piutang' | 'settings'>('perawatan');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col relative">
      <Header />
      <Navigation tab={tab} setTab={setTab} />
      
      <main className="flex-grow p-4 pb-24">
        {tab === 'perawatan' && <LogAktivitas />}
        {tab === 'akuntansi' && <BukuKas />}
        {tab === 'utang_piutang' && <UtangPiutang />}
        {tab === 'settings' && <Pengaturan />}
      </main>
    </div>
  );
}
