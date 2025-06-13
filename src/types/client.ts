import { ClientStatus } from '@/lib/flowStates';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'prospective';
  created_at: string;
  updated_at?: string;
  address?: string;
  company?: string;
  notes?: string;
  estimated_value?: number;
  source?: string;
  assigned_to?: string;
} 