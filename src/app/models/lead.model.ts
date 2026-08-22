export interface Lead {
  id: string;
  customerName: string;
  phone: string;
  productId: string;
  notes: string;
  createdAt: string;
}

export type NewLead = Omit<Lead, 'id' | 'createdAt'>;
