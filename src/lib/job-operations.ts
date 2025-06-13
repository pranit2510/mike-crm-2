import { supabase } from './supabase';
import { Job } from '@/types/job';

export const jobOperations = {
  async getAll(): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        clients (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }

    return data.map(job => ({
      ...job,
      client_name: job.clients?.name || 'Unknown'
    }));
  },

  async getById(id: string): Promise<Job | null> {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        clients (
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      throw error;
    }

    if (!data) return null;

    return {
      ...data,
      client_name: data.clients?.name || 'Unknown'
    };
  },

  async create(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      throw error;
    }

    return data;
  },

  async update(id: string, updates: Partial<Job>): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      throw error;
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }
}; 