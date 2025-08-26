import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface BillingRecord {
  id: string;
  organization_id: string;
  period: string;
  plan_type: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  invoice_url: string | null;
  created_at: string;
}

export function useBillingHistory() {
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useAuth();

  useEffect(() => {
    if (organization) {
      loadBillingHistory();
    }
  }, [organization]);

  const loadBillingHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('billing_history')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setBillingHistory(data || []);
    } catch (err) {
      setError('請求履歴の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const createBillingRecord = async (billingData: {
    period: string;
    plan_type: string;
    amount: number;
    status?: 'pending' | 'paid' | 'failed';
    invoice_url?: string;
  }) => {
    try {
      if (!organization) {
        return { success: false, error: '組織情報が見つかりません' };
      }

      const { data, error } = await supabase
        .from('billing_history')
        .insert({
          organization_id: organization.id,
          ...billingData
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      await loadBillingHistory();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: '請求記録の作成に失敗しました' };
    }
  };

  return {
    billingHistory,
    loading,
    error,
    createBillingRecord,
    refetch: loadBillingHistory
  };
}