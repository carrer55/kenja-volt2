import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface AllowanceSetting {
  id: string;
  organization_id: string;
  position: string;
  domestic_daily: number;
  domestic_accommodation: number;
  overseas_daily: number;
  overseas_accommodation: number;
  created_at: string;
  updated_at: string;
}

export function useAllowanceSettings() {
  const [allowanceSettings, setAllowanceSettings] = useState<AllowanceSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useAuth();

  useEffect(() => {
    if (organization) {
      loadAllowanceSettings();
    }
  }, [organization]);

  const loadAllowanceSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('allowance_settings')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('position');

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setAllowanceSettings(data || []);
    } catch (err) {
      setError('日当設定の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updateAllowanceSetting = async (position: string, updates: Partial<AllowanceSetting>) => {
    try {
      if (!organization) {
        return { success: false, error: '組織情報が見つかりません' };
      }

      const { data, error } = await supabase
        .from('allowance_settings')
        .upsert({
          organization_id: organization.id,
          position,
          ...updates
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      await loadAllowanceSettings();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: '日当設定の更新に失敗しました' };
    }
  };

  const getAllowanceForPosition = (position: string) => {
    return allowanceSettings.find(setting => setting.position === position);
  };

  return {
    allowanceSettings,
    loading,
    error,
    updateAllowanceSetting,
    getAllowanceForPosition,
    refetch: loadAllowanceSettings
  };
}