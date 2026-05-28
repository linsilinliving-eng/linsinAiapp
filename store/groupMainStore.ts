import { create } from 'zustand';
import axios from 'axios';

interface GroupMain {
  uuid: string;
  groupmain_id: string;
  groupmain_name: string;
  groupmain_max: number;
  item_index: number;
  created_by?: string;
  updated_by?: string;
}

interface GroupMainState {
  groups: GroupMain[];
  isLoading: boolean;
  fetchGroups: () => Promise<void>;
  addGroup: (group: Omit<GroupMain, 'uuid'>) => Promise<void>;
  updateGroup: (group: GroupMain) => Promise<void>;
  deleteGroup: (uuid: string) => Promise<void>;
}

export const useGroupMainStore = create<GroupMainState>((set, get) => ({
  groups: [],
  isLoading: false,
  fetchGroups: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get('/api/group-main');
      set({ groups: response.data, isLoading: false });
    } catch (error) {
      console.error('Fetch main groups error:', error);
      set({ isLoading: false });
    }
  },
  addGroup: async (group) => {
    try {
      await axios.post('/api/group-main', group);
      await get().fetchGroups();
    } catch (error) {
      console.error('Add main group error:', error);
      throw error;
    }
  },
  updateGroup: async (group) => {
    try {
      await axios.put('/api/group-main', group);
      await get().fetchGroups();
    } catch (error) {
      console.error('Update main group error:', error);
      throw error;
    }
  },
  deleteGroup: async (uuid) => {
    try {
      await axios.delete(`/api/group-main?uuid=${uuid}`);
      await get().fetchGroups();
    } catch (error) {
      console.error('Delete main group error:', error);
      throw error;
    }
  },
}));
