export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'prospective';
  created_at: string;
  updated_at: string;
  address?: string;
  company?: string;
  notes?: string;
} 