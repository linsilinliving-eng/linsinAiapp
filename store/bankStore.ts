import { create } from 'zustand';
import axios from 'axios';

interface Bank {
  uuid: string;
  bank_id: string;
  bank_name: string;
  created_by?: string;
  updated_by?: string;
}

interface BankState {
  banks: Bank[];
  isLoading: boolean;
  fetchBanks: () => Promise<void>;
  addBank: (bank: Omit<Bank, 'uuid'>) => Promise<void>;
  updateBank: (bank: Bank) => Promise<void>;
  deleteBank: (uuid: string) => Promise<void>;
}

export const useBankStore = create<BankState>((set, get) => ({
  banks: [],
  isLoading: false,
  fetchBanks: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get('/api/banks');
      set({ banks: response.data, isLoading: false });
    } catch (error) {
      console.error('Fetch banks error:', error);
      set({ isLoading: false });
    }
  },
  addBank: async (bank) => {
    try {
      await axios.post('/api/banks', bank);
      await get().fetchBanks();
    } catch (error) {
      console.error('Add bank error:', error);
      throw error;
    }
  },
  updateBank: async (bank) => {
    try {
      await axios.put('/api/banks', bank);
      await get().fetchBanks();
    } catch (error) {
      console.error('Update bank error:', error);
      throw error;
    }
  },
  deleteBank: async (uuid) => {
    try {
      await axios.delete(`/api/banks?uuid=${uuid}`);
      await get().fetchBanks();
    } catch (error) {
      console.error('Delete bank error:', error);
      throw error;
    }
  },
}));
