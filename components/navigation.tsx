'use client';

interface NavigationProps {
  tab: 'perawatan' | 'akuntansi' | 'settings';
  setTab: (tab: 'perawatan' | 'akuntansi' | 'settings') => void;
}

export default function Navigation({ tab, setTab }: NavigationProps) {
  const tabs = [
    { id: 'perawatan', label: 'Rawat' },
    { id: 'akuntansi', label: 'Keuangan' },
    { id: 'settings', label: 'Sistem' },
  ] as const;

  return (
    <nav className="flex border-b sticky top-[72px] bg-white z-10 shadow-sm">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`flex-1 py-4 text-[11px] font-black uppercase transition-all ${
            tab === t.id
              ? 'border-b-4 border-green-600 text-green-700 font-bold'
              : 'text-gray-400'
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
