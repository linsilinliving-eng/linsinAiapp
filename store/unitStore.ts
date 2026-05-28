import { create } from 'zustand';

interface ProductUnit {
  uuid: string;
  unitname: string;
  unit_index: number;
  created_at: string;
  created_by: string;
  updated_at: string;
}

interface UnitState {
  units: ProductUnit[];
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  setUnits: (units: ProductUnit[]) => void;
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: number) => void;
  addUnit: (unit: any) => Promise<boolean>;
  updateUnit: (unit: any) => Promise<boolean>;
  deleteUnit: (uuid: string) => Promise<boolean>;
  paginatedUnits: () => ProductUnit[];
  fetchUnits: () => Promise<void>;
}

export const useUnitStore = create<UnitState>((set, get) => ({
  units: [],
  loading: false,
  currentPage: 1,
  itemsPerPage: 10,
  setUnits: (units) => set({ units }),
  setLoading: (loading) => set({ loading }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  
  paginatedUnits: () => {
    const { units, currentPage, itemsPerPage } = get();
    const start = (currentPage - 1) * itemsPerPage;
    return units.slice(start, start + itemsPerPage);
  },

  fetchUnits: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/product-units");
      const data = await res.json();
      if (res.ok) {
        set({ units: data });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      set({ loading: false });
    }
  },

  addUnit: async (unit) => {
    try {
      const res = await fetch("/api/product-units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unit),
      });
      const data = await res.json();
      if (res.ok) {
        get().fetchUnits();
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  },

  updateUnit: async (unit) => {
    try {
      const res = await fetch("/api/product-units", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unit),
      });
      if (res.ok) {
        get().fetchUnits();
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  },

  deleteUnit: async (uuid) => {
    try {
      const res = await fetch(`/api/product-units?uuid=${uuid}`, {
        method: "DELETE",
      });
      if (res.ok) {
        get().fetchUnits();
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  },

  addUnitLocal: (unit: any) => set((state) => ({ units: [...state.units, unit] })),
  removeUnit: (uuid: string) => set((state) => ({
    units: state.units.filter((u) => u.uuid !== uuid),
  })),
}));
