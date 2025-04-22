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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          institute: string | null
          country: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          institute?: string | null
          country?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          institute?: string | null
          country?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      waitlist: {
        Row: {
          id: string
          email: string
          full_name: string
          institute: string | null
          country: string | null
          research_interests: string | null
          role: string | null
          created_at: string
          status: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          institute?: string | null
          country?: string | null
          research_interests?: string | null
          role?: string | null
          created_at?: string
          status?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          institute?: string | null
          country?: string | null
          research_interests?: string | null
          role?: string | null
          created_at?: string
          status?: string
        }
      }
    }
  }
}