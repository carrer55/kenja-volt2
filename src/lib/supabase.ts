import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 接続テスト関数
export async function testConnection() {
  try {
    // まず基本的な接続テスト
    const { data: healthCheck, error: healthError } = await supabase
      .from('organizations')
      .select('count', { count: 'exact', head: true });
    
    if (healthError) {
      console.error('Supabase connection error:', healthError);
      return { success: false, error: healthError.message };
    }

    // テーブル構造の確認
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase connection successful', { tableExists: true, data });
    return { 
      success: true, 
      message: 'Supabase接続成功',
      details: {
        tableExists: true,
        recordCount: data?.length || 0
      }
    };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: 'データベース接続に失敗しました' };
  }
}