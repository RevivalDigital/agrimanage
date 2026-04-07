import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  date: string;
}

interface AppState {
  logs: Log[];
  transactions: Transaction[];
  balance: number;
  addLog: (log: Log) => void;
  updateLog: (index: number, log: Log) => void;
  deleteLog: (index: number) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (index: number, transaction: Transaction) => void;
  deleteTransaction: (index: number) => void;
  calculateBalance: () => void;
  clearAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      logs: [],
      transactions: [],
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
          balance: 0,
        });
      },
    }),
    {
      name: 'agri-store',
      version: 3,
    }
  )
);
