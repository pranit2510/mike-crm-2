export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  client_id: string;
  client_name: string;
  description?: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  start_date?: string;
  estimated_duration?: string;
  actual_duration?: string;
  budget?: number;
  actual_cost?: number;
  completion_percentage?: number;
  service_address?: string;
  assigned_technicians?: string[];
} 