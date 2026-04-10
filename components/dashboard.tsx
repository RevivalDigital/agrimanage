'use client';

import { useAppStore } from '@/lib/store';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Dashboard() {
  const { logs, transactions, utangPiutang, harvests } = useAppStore();

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculate totals
  const totalIn = transactions
    .filter((t) => t.type === 'in')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalOut = transactions
    .filter((t) => t.type === 'out')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIn - totalOut;

  const totalUtang = utangPiutang
    .filter((item) => item.type === 'utang')
    .reduce((acc, curr) => acc + (curr.amount - curr.paid), 0);

  const totalPiutang = utangPiutang
    .filter((item) => item.type === 'piutang')
    .reduce((acc, curr) => acc + (curr.amount - curr.paid), 0);

  // Calculate net balance (including utang/piutang)
  const netBalance = balance - totalUtang + totalPiutang;

  const totalUtangLunas = utangPiutang
    .filter((item) => item.type === 'utang' && item.status === 'lunas')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPiutangLunas = utangPiutang
    .filter((item) => item.type === 'piutang' && item.status === 'lunas')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Chart data - last 30 days transactions
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const transactionsByDay = last30Days.map((date) => {
    const dayTransactions = transactions.filter((t) => t.date === date);
    const inAmount = dayTransactions
      .filter((t) => t.type === 'in')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const outAmount = dayTransactions
      .filter((t) => t.type === 'out')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      date: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      masuk: inAmount,
      keluar: outAmount,
    };
  });

  // Pie chart data for utang/piutang status
  const utangStatus = [
    { name: 'Lunas', value: totalUtangLunas },
    { name: 'Belum Lunas', value: totalUtang - totalUtangLunas },
  ];

  const piutangStatus = [
    { name: 'Lunas', value: totalPiutangLunas },
    { name: 'Belum Lunas', value: totalPiutang - totalPiutangLunas },
  ];

  // Get upcoming activities (future dates) - sorted by nearest first
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingLogs = logs
    .filter((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group harvests by crop name
  const harvestsByCategory = harvests.reduce(
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

  const COLORS = ['#10b981', '#fbbf24'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xs font-black text-gray-400 uppercase mb-4">Ringkasan Dashboard</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <p className="text-[9px] font-black text-blue-600 uppercase">Saldo</p>
            <p className={`text-lg font-bold mt-1 ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              {formatIDR(balance)}
            </p>
            <p className="text-[10px] text-blue-500 mt-1">
              Netto: {formatIDR(netBalance)}
            </p>
          </div>

          {/* Activity Count */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <p className="text-[9px] font-black text-green-600 uppercase">Aktivitas</p>
            <p className="text-lg font-bold text-green-700 mt-2">{logs.length} Log</p>
          </div>

          {/* Total In */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
            <p className="text-[9px] font-black text-emerald-600 uppercase">Total Masuk</p>
            <p className="text-lg font-bold text-emerald-700 mt-2">{formatIDR(totalIn)}</p>
          </div>

          {/* Total Out */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
            <p className="text-[9px] font-black text-red-600 uppercase">Total Keluar</p>
            <p className="text-lg font-bold text-red-700 mt-2">{formatIDR(totalOut)}</p>
          </div>

          {/* Total Utang */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
            <p className="text-[9px] font-black text-orange-600 uppercase">Utang (Sisa)</p>
            <p className="text-lg font-bold text-orange-700 mt-2">{formatIDR(totalUtang)}</p>
          </div>

          {/* Total Piutang */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <p className="text-[9px] font-black text-purple-600 uppercase">Piutang (Sisa)</p>
            <p className="text-lg font-bold text-purple-700 mt-2">{formatIDR(totalPiutang)}</p>
          </div>
        </div>
      </div>

      {/* Todo List - Upcoming Activities */}
      {upcomingLogs.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-xs font-bold text-gray-600 uppercase mb-3">To-Do List</h3>
          <div className="space-y-2">
            {upcomingLogs.slice(0, 5).map((log, idx) => (
              <div key={idx} className="flex gap-2 items-start p-2 bg-blue-50 rounded border border-blue-100">
                <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-700">{log.activity}</p>
                  <p className="text-[8px] text-gray-400 mt-0.5">
                    {new Date(log.date).toLocaleDateString('id-ID', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Harvest by Category */}
      {harvestsByCategory.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-xs font-bold text-gray-600 uppercase mb-3">Panen per Kategori</h3>
          <div className="grid grid-cols-2 gap-2">
            {harvestsByCategory.slice(0, 4).map((category) => (
              <div
                key={category.cropName}
                className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3 shadow-sm"
              >
                <p className="text-[9px] font-bold text-green-700 uppercase truncate">{category.cropName}</p>
                <p className="text-sm font-bold text-green-600 mt-1">{category.totalKg.toLocaleString('id-ID')} kg</p>
                <p className="text-[8px] text-gray-500 mt-1">{category.count}x panen</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="space-y-6">
        {/* Transaction Chart */}
        {transactions.length > 0 && (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-xs font-bold text-gray-600 uppercase mb-4">Transaksi 30 Hari Terakhir</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={transactionsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  stroke="#e5e7eb"
                />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} stroke="#e5e7eb" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => formatIDR(value as number)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="masuk"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                  name="Masuk"
                />
                <Line
                  type="monotone"
                  dataKey="keluar"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444' }}
                  name="Keluar"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Utang/Piutang Status */}
        {utangPiutang.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {/* Utang Status */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-xs font-bold text-gray-600 uppercase mb-4">Status Utang</h3>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={utangStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {utangStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatIDR(value as number)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1 text-[9px]">
                <p className="text-emerald-600 font-bold">Lunas: {formatIDR(totalUtangLunas)}</p>
                <p className="text-amber-600 font-bold">
                  Belum: {formatIDR(totalUtang - totalUtangLunas)}
                </p>
              </div>
            </div>

            {/* Piutang Status */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-xs font-bold text-gray-600 uppercase mb-4">Status Piutang</h3>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={piutangStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {piutangStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatIDR(value as number)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1 text-[9px]">
                <p className="text-emerald-600 font-bold">Lunas: {formatIDR(totalPiutangLunas)}</p>
                <p className="text-amber-600 font-bold">
                  Belum: {formatIDR(totalPiutang - totalPiutangLunas)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {logs.length === 0 && transactions.length === 0 && utangPiutang.length === 0 && harvests.length === 0 && (
          <div className="bg-white border rounded-lg p-8 text-center">
            <p className="text-sm text-gray-400">Mulai dengan menambahkan data untuk melihat ringkasan</p>
          </div>
        )}
      </div>
    </div>
  );
}
