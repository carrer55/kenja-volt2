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
    // 段階的なテーブル確認
    const tableChecks = [];
    
    // organizationsテーブルの確認
    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .limit(1);
      
      tableChecks.push({
        table: 'organizations',
        exists: !orgError,
        error: orgError?.message
      });
    } catch (err) {
      tableChecks.push({
        table: 'organizations',
        exists: false,
        error: 'テーブルが存在しません'
      });
    }

    // usersテーブルの確認
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      tableChecks.push({
        table: 'users',
        exists: !userError,
        error: userError?.message
      });
    } catch (err) {
      tableChecks.push({
        table: 'users',
        exists: false,
        error: 'テーブルが存在しません'
      });
    }

    const allTablesExist = tableChecks.every(check => check.exists);
    
    console.log('Database structure check:', tableChecks);
    
    return { 
      success: true, 
      message: allTablesExist ? 'データベース構築完了' : 'データベース構築中',
      details: {
        tables: tableChecks,
        allTablesReady: allTablesExist
      }
    };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: 'データベース接続に失敗しました' };
  }
}