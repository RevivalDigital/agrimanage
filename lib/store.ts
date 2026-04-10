import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getFromDB, setToDB, removeFromDB } from './indexeddb';

interface Log {
  activity: string;
  category: string;
  note: string;
  date: string;
}

interface Transaction {
  item: string;
  amount: number;
  type: 'in' | 'out';
  category?: 'ongkos_pekerja' | 'pestisida' | 'pupuk' | 'lainnya' | 'pemasukan';
  date: string;
}

interface UtangPiutang {
  description: string;
  amount: number;
  paid: number;
  type: 'utang' | 'piutang';
  party: string;
  date: string;
  status: 'lunas' | 'belum_lunas';
}

interface Harvest {
  cropName: string;
  kg: number;
  pricePerKg: number;
  nominalValue: number;
  date: string;
  notes: string;
}

interface AppState {
  logs: Log[];
  transactions: Transaction[];
  utangPiutang: UtangPiutang[];
  harvests: Harvest[];
  balance: number;
  addLog: (log: Log) => void;
  updateLog: (index: number, log: Log) => void;
  deleteLog: (index: number) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (index: number, transaction: Transaction) => void;
  deleteTransaction: (index: number) => void;
  addUtangPiutang: (item: UtangPiutang) => void;
  updateUtangPiutang: (index: number, item: UtangPiutang) => void;
  deleteUtangPiutang: (index: number) => void;
  payPartialUtangPiutang: (index: number, amount: number) => void;
  addHarvest: (harvest: Harvest) => void;
  updateHarvest: (index: number, harvest: Harvest) => void;
  deleteHarvest: (index: number) => void;
  calculateBalance: () => void;
  clearAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      logs: [],
      transactions: [],
      utangPiutang: [],
      harvests: [],
      balance: 0,

      addLog: (log) => {
        set((state) => ({
          logs: [log, ...state.logs],
        }));
      },

      updateLog: (index, log) => {
        set((state) => {
          const newLogs = [...state.logs];
          newLogs[index] = log;
          return { logs: newLogs };
        });
      },

      deleteLog: (index) => {
        set((state) => ({
          logs: state.logs.filter((_, i) => i !== index),
        }));
      },

      addTransaction: (transaction) => {
        set((state) => {
          const newTransactions = [transaction, ...state.transactions];
          const newBalance = newTransactions.reduce((acc, curr) => {
            return curr.type === 'out' ? acc - curr.amount : acc + curr.amount;
          }, 0);
          return {
            transactions: newTransactions,
            balance: newBalance,
          };
        });
      },

      updateTransaction: (index, transaction) => {
        set((state) => {
          const newTransactions = [...state.transactions];
          newTransactions[index] = transaction;
          const newBalance = newTransactions.reduce((acc, curr) => {
            return curr.type === 'out' ? acc - curr.amount : acc + curr.amount;
          }, 0);
          return {
            transactions: newTransactions,
            balance: newBalance,
          };
        });
      },

      deleteTransaction: (index) => {
        set((state) => {
          const newTransactions = state.transactions.filter((_, i) => i !== index);
          const newBalance = newTransactions.reduce((acc, curr) => {
            return curr.type === 'out' ? acc - curr.amount : acc + curr.amount;
          }, 0);
          return {
            transactions: newTransactions,
            balance: newBalance,
          };
        });
      },

      addUtangPiutang: (item) => {
        set((state) => ({
          utangPiutang: [item, ...state.utangPiutang],
        }));
      },

      updateUtangPiutang: (index, item) => {
        set((state) => {
          const newUtangPiutang = [...state.utangPiutang];
          newUtangPiutang[index] = item;
          return { utangPiutang: newUtangPiutang };
        });
      },

      deleteUtangPiutang: (index) => {
        set((state) => ({
          utangPiutang: state.utangPiutang.filter((_, i) => i !== index),
        }));
      },

      payPartialUtangPiutang: (index, amount) => {
        set((state) => {
          const newUtangPiutang = [...state.utangPiutang];
          const item = newUtangPiutang[index];
          const newPaid = Math.min(item.paid + amount, item.amount);
          newUtangPiutang[index] = {
            ...item,
            paid: newPaid,
            status: newPaid >= item.amount ? 'lunas' : 'belum_lunas',
          };
          return { utangPiutang: newUtangPiutang };
        });
      },

      addHarvest: (harvest) => {
        set((state) => ({
          harvests: [harvest, ...state.harvests],
        }));
      },

      updateHarvest: (index, harvest) => {
        set((state) => {
          const newHarvests = [...state.harvests];
          newHarvests[index] = harvest;
          return { harvests: newHarvests };
        });
      },

      deleteHarvest: (index) => {
        set((state) => ({
          harvests: state.harvests.filter((_, i) => i !== index),
        }));
      },

      calculateBalance: () => {
        set((state) => {
          const newBalance = state.transactions.reduce((acc, curr) => {
            return curr.type === 'out' ? acc - curr.amount : acc + curr.amount;
          }, 0);
          return { balance: newBalance };
        });
      },

      clearAllData: () => {
        set({
          logs: [],
          transactions: [],
          utangPiutang: [],
          harvests: [],
          balance: 0,
        });
      },
    }),
    {
      name: 'agri-store',
      version: 4,
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          const data = await getFromDB(name);
          return data ? JSON.stringify(data) : null;
        },
        setItem: async (name: string, value: string) => {
          const data = JSON.parse(value);
          await setToDB(name, data);
        },
        removeItem: async (name: string) => {
          await removeFromDB(name);
        },
      })),
    }
  )
);
