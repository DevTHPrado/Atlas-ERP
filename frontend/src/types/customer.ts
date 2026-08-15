export type PersonType = "PF" | "PJ";

export interface Customer {
  id: string;
  company_id: string;
  person_type: PersonType;
  name: string;
  trade_name?: string | null;
  tax_id?: string | null;
  state_registration?: string | null;
  municipal_registration?: string | null;

  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  whatsapp?: string | null;
  contact_name?: string | null;
  contact_role?: string | null;

  zip_code?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;

  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CustomerCreate = Omit<
  Customer,
  "id" | "company_id" | "created_at" | "updated_at"
>;

export type CustomerUpdate = Partial<CustomerCreate>;

export interface PaginatedResponse<T> {
  total: number;
  items: T[];
  skip: number;
  limit: number;
}
