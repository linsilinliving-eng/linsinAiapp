'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Initial Mock Data
const INITIAL_USERS = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active' },
];

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Premium Wireless Headphones', price: 299, category: 'Electronics', stock: 12, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&h=200&auto=format&fit=crop' },
];

const INITIAL_ORDERS = [
  { id: '#4502', date: '2024-05-01', customer: 'John Doe', total: '$120.00', status: 'Completed', payment: 'Credit Card' },
];

interface StoreContextType {
  users: any[];
  products: any[];
  orders: any[];
  addProduct: (product: any) => void;
  deleteProduct: (id: number) => void;
  deleteUser: (id: number) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders] = useState(INITIAL_ORDERS);

  const addProduct = (product: any) => {
    setProducts((prev) => [...prev, { ...product, id: Date.now() }]);
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter(p => p.id !== id));
  };

  const deleteUser = (id: number) => {
    setUsers((prev) => prev.filter(u => u.id !== id));
  };

  return (
    <StoreContext.Provider value={{ users, products, orders, addProduct, deleteProduct, deleteUser }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
