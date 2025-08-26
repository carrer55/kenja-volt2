import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          plan_type: 'free' | 'pro' | 'enterprise';
          user_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan_type: 'free' | 'pro' | 'enterprise';
          user_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          plan_type?: 'free' | 'pro' | 'enterprise';
          user_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          organization_id: string;
          auth_user_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          position: '代表取締役' | '取締役' | '部長' | '課長' | '主任' | '一般職' | null;
          department: string | null;
          role: 'admin' | 'approver' | 'user';
          status: 'active' | 'inactive' | 'invited';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          auth_user_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          position?: '代表取締役' | '取締役' | '部長' | '課長' | '主任' | '一般職' | null;
          department?: string | null;
          role: 'admin' | 'approver' | 'user';
          status?: 'active' | 'inactive' | 'invited';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          auth_user_id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          position?: '代表取締役' | '取締役' | '部長' | '課長' | '主任' | '一般職' | null;
          department?: string | null;
          role?: 'admin' | 'approver' | 'user';
          status?: 'active' | 'inactive' | 'invited';
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          organization_id: string;
          applicant_id: string;
          type: 'business_trip' | 'expense';
          title: string;
          purpose: string | null;
          status: 'draft' | 'pending' | 'approved' | 'rejected' | 'returned';
          estimated_amount: number;
          actual_amount: number;
          start_date: string | null;
          end_date: string | null;
          destination: string | null;
          details: any;
          attachments: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          applicant_id: string;
          type: 'business_trip' | 'expense';
          title: string;
          purpose?: string | null;
          status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'returned';
          estimated_amount?: number;
          actual_amount?: number;
          start_date?: string | null;
          end_date?: string | null;
          destination?: string | null;
          details?: any;
          attachments?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          applicant_id?: string;
          type?: 'business_trip' | 'expense';
          title?: string;
          purpose?: string | null;
          status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'returned';
          estimated_amount?: number;
          actual_amount?: number;
          start_date?: string | null;
          end_date?: string | null;
          destination?: string | null;
          details?: any;
          attachments?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      allowance_settings: {
        Row: {
          id: string;
          organization_id: string;
          position: string;
          domestic_daily: number;
          domestic_accommodation: number;
          overseas_daily: number;
          overseas_accommodation: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          position: string;
          domestic_daily?: number;
          domestic_accommodation?: number;
          overseas_daily?: number;
          overseas_accommodation?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          position?: string;
          domestic_daily?: number;
          domestic_accommodation?: number;
          overseas_daily?: number;
          overseas_accommodation?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'approval_request' | 'status_update' | 'system';
          read: boolean;
          related_application_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: 'approval_request' | 'status_update' | 'system';
          read?: boolean;
          related_application_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'approval_request' | 'status_update' | 'system';
          read?: boolean;
          related_application_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// 接続テスト関数
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase connection successful');
    return { success: true, message: 'Supabase接続成功' };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: 'Connection failed' };
  }
}