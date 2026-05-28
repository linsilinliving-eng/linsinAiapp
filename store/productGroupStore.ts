import { create } from 'zustand';
import axios from 'axios';

interface ProductGroup {
  uuid: string;
  code: string;
  name: string;
  item_index: number;
  groupmain_id: string;
  groupmain_name?: string;
  created_by?: string;
  updated_by?: string;
}

interface ProductGroupState {
  productGroups: ProductGroup[];
  isLoading: boolean;
  fetchProductGroups: () => Promise<void>;
  addProductGroup: (group: Omit<ProductGroup, 'uuid'>) => Promise<void>;
  updateProductGroup: (group: ProductGroup) => Promise<void>;
  deleteProductGroup: (uuid: string) => Promise<void>;
}

export const useProductGroupStore = create<ProductGroupState>((set, get) => ({
  productGroups: [],
  isLoading: false,
  fetchProductGroups: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get('/api/product-groups');
      set({ productGroups: response.data, isLoading: false });
    } catch (error) {
      console.error('Fetch product groups error:', error);
      set({ isLoading: false });
    }
  },
  addProductGroup: async (group) => {
    try {
      await axios.post('/api/product-groups', group);
      await get().fetchProductGroups();
    } catch (error) {
      console.error('Add product group error:', error);
      throw error;
    }
  },
  updateProductGroup: async (group) => {
    try {
      await axios.put('/api/product-groups', group);
      await get().fetchProductGroups();
    } catch (error) {
      console.error('Update product group error:', error);
      throw error;
    }
  },
  deleteProductGroup: async (uuid) => {
    try {
      await axios.delete(`/api/product-groups?uuid=${uuid}`);
      await get().fetchProductGroups();
    } catch (error) {
      console.error('Delete product group error:', error);
      throw error;
    }
  },
}));
