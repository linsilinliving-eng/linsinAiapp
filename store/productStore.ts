import { create } from "zustand";
import axios from "axios";

export interface Product {
  uuid: string;
  product_code: string;
  product_name: string;
  product_unit: string;
  product_group: string;
  product_group_name?: string;
  supplier_code: string;
  sale_price: number;
  purchase_price: number;
  product_status: string;
  stock_status: string;
  cloth_face: number;
  width_start: number;
  width_end: number;
  item_type: string;
  item_kg: number;
  type_price: string;
  product_lower: number;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "uuid">) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (uuid: string) => Promise<boolean>;
  setCurrentPage: (page: number) => void;
  paginatedProducts: () => Product[];
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  currentPage: 1,
  itemsPerPage: 10,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get("/api/products");
      set({ products: response.data, isLoading: false });
    } catch (error) {
      console.error("Fetch products error:", error);
      set({ isLoading: false });
    }
  },

  addProduct: async (product) => {
    try {
      await axios.post("/api/products", product);
      await get().fetchProducts();
      return true;
    } catch (error) {
      console.error("Add product error:", error);
      return false;
    }
  },

  updateProduct: async (product) => {
    try {
      await axios.put("/api/products", product);
      await get().fetchProducts();
      return true;
    } catch (error) {
      console.error("Update product error:", error);
      return false;
    }
  },

  deleteProduct: async (uuid) => {
    try {
      await axios.delete(`/api/products?uuid=${uuid}`);
      await get().fetchProducts();
      return true;
    } catch (error) {
      console.error("Delete product error:", error);
      return false;
    }
  },

  setCurrentPage: (page) => set({ currentPage: page }),

  paginatedProducts: () => {
    const { products, currentPage, itemsPerPage } = get();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  },
}));
