import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
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
}

export interface Organization {
  id: string;
  name: string;
  plan_type: 'free' | 'pro' | 'enterprise';
  user_limit: number;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    organization: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    // 初期認証状態を確認
    checkAuthState();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          organization: null,
          isAuthenticated: false,
          loading: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      // ユーザープロフィールを取得
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          organizations (*)
        `)
        .eq('auth_user_id', authUser.id)
        .single();

      if (userError) {
        console.error('Failed to load user profile:', userError);
        setAuthState(prev => ({ ...prev, loading: false }));
        return;
      }

      setAuthState({
        user: userProfile,
        organization: userProfile.organizations,
        isAuthenticated: true,
        loading: false
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, error: error.message };
      }

      // ユーザープロフィールは onAuthStateChange で自動的に読み込まれる
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: 'ログインに失敗しました' };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    company: string;
    position: string;
    phone: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      // 1. Supabase Authでユーザー作成
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });

      if (authError) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, error: 'ユーザー作成に失敗しました' };
      }

      // 2. 組織を作成
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: userData.company,
          plan_type: 'free',
          user_limit: 1
        })
        .select()
        .single();

      if (orgError) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, error: '組織作成に失敗しました' };
      }

      // 3. ユーザープロフィールを作成
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          organization_id: orgData.id,
          auth_user_id: authData.user.id,
          full_name: userData.name,
          email: userData.email,
          phone: userData.phone,
          position: userData.position as any,
          role: 'admin', // 最初のユーザーは管理者
          status: 'active'
        });

      if (profileError) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, error: 'プロフィール作成に失敗しました' };
      }

      // 4. デフォルトの日当設定を作成
      const defaultAllowances = [
        { position: '代表取締役', domestic_daily: 8000, domestic_accommodation: 15000, overseas_daily: 12000, overseas_accommodation: 25000 },
        { position: '取締役', domestic_daily: 7000, domestic_accommodation: 12000, overseas_daily: 10500, overseas_accommodation: 20000 },
        { position: '部長', domestic_daily: 6000, domestic_accommodation: 10000, overseas_daily: 9000, overseas_accommodation: 18000 },
        { position: '課長', domestic_daily: 5500, domestic_accommodation: 9000, overseas_daily: 8250, overseas_accommodation: 16000 },
        { position: '主任', domestic_daily: 5000, domestic_accommodation: 8000, overseas_daily: 7500, overseas_accommodation: 14000 },
        { position: '一般職', domestic_daily: 5000, domestic_accommodation: 8000, overseas_daily: 7500, overseas_accommodation: 14000 }
      ];

      await supabase
        .from('allowance_settings')
        .insert(
          defaultAllowances.map(allowance => ({
            organization_id: orgData.id,
            ...allowance
          }))
        );

      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: '登録に失敗しました' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!authState.user) {
        return { success: false, error: 'ユーザーが見つかりません' };
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      setAuthState(prev => ({
        ...prev,
        user: data
      }));

      return { success: true, data };
    } catch (error) {
      return { success: false, error: '更新に失敗しました' };
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile
  };
}