import { create } from "zustand";

export interface CompanyData {
  uuid: string;
  company_name: string;
  company_taxid: string;
  branch_name: string;
  branch_no: string;
  company_address1: string;
  company_sing: string;
  company_tel: string;
  company_email: string;
  company_fax: string;
  purchase_tel: string;
  purchase_email: string;
  purchase_address: string;
  purchase_confirm: string;
  updated_at?: string;
  updated_by?: string;
}

interface CompanyStore {
  company: CompanyData | null;
  isLoading: boolean;
  isSaving: boolean;
  fetchCompany: () => Promise<void>;
  saveCompany: (data: Partial<CompanyData>) => Promise<boolean>;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  company: null,
  isLoading: false,
  isSaving: false,

  fetchCompany: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/company");
      const data = await res.json();
      set({ company: data });
    } catch (e) {
      console.error("fetchCompany error", e);
    } finally {
      set({ isLoading: false });
    }
  },

  saveCompany: async (data) => {
    set({ isSaving: true });
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return false;
      const updated = await res.json();
      set({ company: updated });
      return true;
    } catch (e) {
      console.error("saveCompany error", e);
      return false;
    } finally {
      set({ isSaving: false });
    }
  },
}));
