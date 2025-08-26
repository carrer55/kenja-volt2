import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Application {
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
  applicant?: {
    full_name: string;
    department: string | null;
  };
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, organization } = useAuth();

  useEffect(() => {
    if (user && organization) {
      loadApplications();
      
      // リアルタイム更新を設定
      const subscription = supabase
        .channel('applications_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'applications',
            filter: `organization_id=eq.${organization.id}`
          }, 
          () => {
            loadApplications();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, organization]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('applications')
        .select(`
          *,
          applicant:users!applicant_id (
            full_name,
            department
          )
        `)
        .eq('organization_id', organization?.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setApplications(data || []);
    } catch (err) {
      setError('申請データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (applicationData: {
    type: 'business_trip' | 'expense';
    title: string;
    purpose?: string;
    start_date?: string;
    end_date?: string;
    destination?: string;
    estimated_amount?: number;
    details?: any;
  }) => {
    try {
      if (!user || !organization) {
        return { success: false, error: 'ユーザー情報が見つかりません' };
      }

      const { data, error } = await supabase
        .from('applications')
        .insert({
          organization_id: organization.id,
          applicant_id: user.id,
          ...applicationData
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      await loadApplications();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: '申請の作成に失敗しました' };
    }
  };

  const updateApplication = async (id: string, updates: Partial<Application>) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      await loadApplications();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: '申請の更新に失敗しました' };
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      await loadApplications();
      return { success: true };
    } catch (err) {
      return { success: false, error: '申請の削除に失敗しました' };
    }
  };

  const submitApplication = async (id: string) => {
    return updateApplication(id, { status: 'pending' });
  };

  return {
    applications,
    loading,
    error,
    createApplication,
    updateApplication,
    deleteApplication,
    submitApplication,
    refetch: loadApplications
  };
}