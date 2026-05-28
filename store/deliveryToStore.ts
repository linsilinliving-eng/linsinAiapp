import { create } from 'zustand';
import axios from 'axios';
import { DeliveryTo } from '@/lib/validations/deliveryTo';

interface DeliveryToState {
  deliveryLocations: DeliveryTo[];
  isLoading: boolean;
  fetchDeliveryLocations: () => Promise<void>;
  addDeliveryLocation: (data: DeliveryTo) => Promise<void>;
  updateDeliveryLocation: (data: DeliveryTo) => Promise<void>;
  deleteDeliveryLocation: (uuid: string) => Promise<void>;
}

export const useDeliveryToStore = create<DeliveryToState>((set) => ({
  deliveryLocations: [],
  isLoading: false,
  fetchDeliveryLocations: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get('/api/delivery-to');
      set({ deliveryLocations: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch delivery locations:', error);
      set({ isLoading: false });
    }
  },
  addDeliveryLocation: async (data) => {
    await axios.post('/api/delivery-to', data);
  },
  updateDeliveryLocation: async (data) => {
    await axios.put('/api/delivery-to', data);
  },
  deleteDeliveryLocation: async (uuid) => {
    await axios.delete(`/api/delivery-to?uuid=${uuid}`);
  },
}));
