import { create } from 'zustand';

interface WithholdingTax {
  whtax_id: string;
  whtax_index: number;
  whtax_name: string;
  whtax_rate: number;
  wht_condition: string;
  // Fields for Sales/Transaction
  wht_docno?: string;
  wht_date?: string;
  wht_suppname?: string;
  total_amount?: number;
  whtax_amount?: number;
  uuid?: string;
}

interface WHTState {
  items: WithholdingTax[];
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  setItems: (items: WithholdingTax[]) => void;
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: number) => void;
  addItem: (item: any) => Promise<boolean>;
  updateItem: (item: any) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  fetchItems: () => Promise<void>;
}

export const useWithholdingTaxStore = create<WHTState>((set, get) => ({
  items: [],
  loading: false,
  currentPage: 1,
  itemsPerPage: 30,
  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),
  setCurrentPage: (currentPage) => set({ currentPage }),

  fetchItems: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/withholding-tax");
      const data = await res.json();
      if (res.ok) {
        set({ items: data });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (item) => {
    try {
      const res = await fetch("/api/withholding-tax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        get().fetchItems();
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  },

  updateItem: async (item) => {
    try {
      const res = await fetch("/api/withholding-tax", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        get().fetchItems();
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  },

  deleteItem: async (id) => {
    try {
      const res = await fetch(`/api/withholding-tax?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        get().fetchItems();
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  },
}));
