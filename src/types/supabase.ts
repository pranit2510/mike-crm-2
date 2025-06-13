export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string
          status: 'active' | 'inactive' | 'prospective'
          address: string | null
          company: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone: string
          status?: 'active' | 'inactive' | 'prospective'
          address?: string | null
          company?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string
          status?: 'active' | 'inactive' | 'prospective'
          address?: string | null
          company?: string | null
          notes?: string | null
        }
      }
      jobs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          client_id: string
          technician_id: string | null
          status: string
          start_time: string | null
          end_time: string | null
          client_name: string
          description: string | null
          price: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          client_id: string
          technician_id?: string | null
          status?: string
          start_time?: string | null
          end_time?: string | null
          client_name: string
          description?: string | null
          price?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          client_id?: string
          technician_id?: string | null
          status?: string
          start_time?: string | null
          end_time?: string | null
          client_name?: string
          description?: string | null
          price?: number | null
        }
      }
      calendar_events: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          job_id: string
          technician_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          job_id: string
          technician_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          job_id?: string
          technician_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 