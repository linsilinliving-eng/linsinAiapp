import { create } from 'zustand';
import axios from 'axios';

interface ProjectType {
  uuid: string;
  project_type: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

interface ProjectTypeState {
  types: ProjectType[];
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  fetchTypes: () => Promise<void>;
  addType: (data: any) => Promise<boolean>;
  updateType: (data: any) => Promise<boolean>;
  deleteType: (uuid: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
  paginatedTypes: () => ProjectType[];
}

export const useProjectTypeStore = create<ProjectTypeState>((set, get) => ({
  types: [],
  loading: false,
  currentPage: 1,
  itemsPerPage: 10,

  fetchTypes: async () => {
    set({ loading: true });
    try {
      const res = await axios.get('/api/project-types');
      set({ types: res.data, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  addType: async (data) => {
    set({ loading: true });
    try {
      await axios.post('/api/project-types', data);
      await get().fetchTypes();
      return true;
    } catch (error) {
      console.error(error);
      set({ loading: false });
      return false;
    }
  },

  updateType: async (data) => {
    set({ loading: true });
    try {
      await axios.put('/api/project-types', data);
      await get().fetchTypes();
      return true;
    } catch (error) {
      console.error(error);
      set({ loading: false });
      return false;
    }
  },

  deleteType: async (uuid) => {
    try {
      await axios.delete(`/api/project-types?uuid=${uuid}`);
      await get().fetchTypes();
    } catch (error) {
      console.error(error);
    }
  },

  setCurrentPage: (page) => set({ currentPage: page }),

  paginatedTypes: () => {
    const { types, currentPage, itemsPerPage } = get();
    const start = (currentPage - 1) * itemsPerPage;
    return types.slice(start, start + itemsPerPage);
  },
}));
