import { create } from 'zustand';
import axios from 'axios';
import { HookSize } from '@/lib/validations/hookSize';

interface HookSizeState {
  hookSizes: HookSize[];
  isLoading: boolean;
  fetchHookSizes: () => Promise<void>;
  addHookSize: (data: HookSize) => Promise<void>;
  updateHookSize: (data: HookSize) => Promise<void>;
  deleteHookSize: (uuid: string) => Promise<void>;
}

export const useHookSizeStore = create<HookSizeState>((set) => ({
  hookSizes: [],
  isLoading: false,
  fetchHookSizes: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get('/api/hook-sizes');
      set({ hookSizes: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch hook sizes:', error);
      set({ isLoading: false });
    }
  },
  addHookSize: async (data) => {
    await axios.post('/api/hook-sizes', data);
  },
  updateHookSize: async (data) => {
    await axios.put('/api/hook-sizes', data);
  },
  deleteHookSize: async (uuid) => {
    await axios.delete(`/api/hook-sizes?uuid=${uuid}`);
  },
}));
