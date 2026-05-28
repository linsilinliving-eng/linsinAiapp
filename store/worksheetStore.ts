import { create } from 'zustand';

interface MasterWorksheet {
  uuid: string;
  type_select1: string;
  type_select2: string;
  type_select3?: string;
  type_select4: string;
  type_select5: string;
  curtain_line: string;
  hook_no: string;
  type_whidth: number;
  type_height: number;
  floor_middle: number;
  floor_over: number;
  jiblontakai: string;
  saw_remark: string;
  master_setup_width: number;
  master_setup_hight: number;
  itemlock: string;
  created_at: string;
}

interface WorksheetState {
  worksheets: MasterWorksheet[];
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  fetchWorksheets: () => Promise<void>;
  addWorksheet: (data: any) => Promise<boolean>;
  updateWorksheet: (data: any) => Promise<boolean>;
  deleteWorksheet: (uuid: string) => Promise<boolean>;
  toggleLock: (uuid: string, lock: string) => Promise<boolean>;
}

export const useWorksheetStore = create<WorksheetState>((set, get) => ({
  worksheets: [],
  isLoading: false,
  currentPage: 1,

  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchWorksheets: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/master-worksheet');
      if (res.ok) {
        const data = await res.json();
        set({ worksheets: data });
      }
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  addWorksheet: async (data) => {
    try {
      const res = await fetch('/api/master-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        get().fetchWorksheets();
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  },

  updateWorksheet: async (data) => {
    try {
      const res = await fetch('/api/master-worksheet', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        get().fetchWorksheets();
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  },

  deleteWorksheet: async (uuid) => {
    try {
      const res = await fetch(`/api/master-worksheet?uuid=${uuid}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        get().fetchWorksheets();
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  },

  toggleLock: async (uuid, lock) => {
    try {
      const res = await fetch('/api/master-worksheet', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, item_lock: lock }),
      });
      if (res.ok) {
        get().fetchWorksheets();
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  },
}));
