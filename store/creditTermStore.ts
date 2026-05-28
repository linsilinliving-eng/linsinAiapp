import { create } from 'zustand';
import axios from 'axios';
import { CreditTerm } from '@/lib/validations/creditTerm';

interface CreditTermState {
  creditTerms: CreditTerm[];
  isLoading: boolean;
  fetchCreditTerms: () => Promise<void>;
  addCreditTerm: (data: CreditTerm) => Promise<void>;
  updateCreditTerm: (data: CreditTerm) => Promise<void>;
  deleteCreditTerm: (uuid: string) => Promise<void>;
}

export const useCreditTermStore = create<CreditTermState>((set) => ({
  creditTerms: [],
  isLoading: false,
  fetchCreditTerms: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get('/api/credit-terms');
      set({ creditTerms: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch credit terms:', error);
      set({ isLoading: false });
    }
  },
  addCreditTerm: async (data) => {
    await axios.post('/api/credit-terms', data);
  },
  updateCreditTerm: async (data) => {
    await axios.put('/api/credit-terms', data);
  },
  deleteCreditTerm: async (uuid) => {
    await axios.delete(`/api/credit-terms?uuid=${uuid}`);
  },
}));
