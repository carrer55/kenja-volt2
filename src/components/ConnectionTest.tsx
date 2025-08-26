import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, Database, Wifi } from 'lucide-react';
import { testConnection } from '../lib/supabase';

function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState('');
  const [tableStatus, setTableStatus] = useState<any[]>([]);

  useEffect(() => {
    const runConnectionTest = async () => {
      setConnectionStatus('testing');
      
      const result = await testConnection();
      
      if (result.success) {
        setConnectionStatus('success');
        setTableStatus(result.details?.tables || []);
      } else {
        setConnectionStatus('error');
        setErrorMessage(result.error || 'Unknown error');
      }
    };

    runConnectionTest();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Loader className="w-8 h-8 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-emerald-600" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'from-blue-500/20 to-blue-700/20 border-blue-300/30';
      case 'success':
        return 'from-emerald-500/20 to-emerald-700/20 border-emerald-300/30';
      case 'error':
        return 'from-red-500/20 to-red-700/20 border-red-300/30';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return { title: 'Supabase接続テスト中...', message: 'データベースへの接続を確認しています' };
      case 'success':
        return { title: 'Supabase接続成功', message: 'データベースに正常に接続されました' };
      case 'error':
        return { title: 'Supabase接続エラー', message: errorMessage };
    }
  };

  const statusText = getStatusText();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* ロゴ */}
          <div className="text-center mb-8">
            <div className="w-full h-24 mx-auto mb-6 flex items-center justify-center">
              <img 
                src="/賢者の精算Logo2_Transparent_NoBuffer copy.png" 
                alt="賢者の精算ロゴ" 
                className="h-full object-contain"
              />
            </div>
          </div>

          {/* 接続ステータスカード */}
          <div className={`backdrop-blur-xl bg-gradient-to-br ${getStatusColor()} rounded-xl p-8 lg:p-12 border shadow-2xl`}>
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/30 flex items-center justify-center">
                {getStatusIcon()}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
                {statusText.title}
              </h1>
              <p className="text-xl text-slate-700 mb-6">{statusText.message}</p>
            </div>

            {/* 接続詳細 */}
            <div className="backdrop-blur-xl bg-white/20 rounded-lg p-6 border border-white/30 mb-8">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Project URL</p>
                      <p className="font-medium text-slate-800 text-xs">tijmpjkcqvxbdygkjxtw.supabase.co</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Wifi className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">接続状態</p>
                      <p className={`font-medium text-xs ${
                        connectionStatus === 'success' ? 'text-emerald-600' :
                        connectionStatus === 'error' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {connectionStatus === 'success' ? '接続済み' :
                         connectionStatus === 'error' ? '接続エラー' : '接続中...'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* テーブル構築状況 */}
                {connectionStatus === 'success' && tableStatus.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">データベーステーブル状況</h4>
                    <div className="space-y-2">
                      {tableStatus.map((table, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/20 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${table.exists ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium text-slate-700">{table.table}テーブル</span>
                          </div>
                          <span className={`text-xs ${table.exists ? 'text-emerald-600' : 'text-red-600'}`}>
                            {table.exists ? '作成済み' : '未作成'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 次のステップ */}
            {connectionStatus === 'success' && (
              <div className="text-slate-600 text-sm">
                {tableStatus.every(t => t.exists) ? (
                  <div>
                    <p className="mb-4">
                      データベースの基本構造が完成しました。次のステップに進むことができます。
                    </p>
                    <div className="bg-emerald-50/50 rounded-lg p-4">
                      <h3 className="font-semibold text-emerald-800 mb-2">✅ 構築完了</h3>
                      <p className="text-emerald-700 text-xs">
                        organizationsテーブルとusersテーブルが正常に作成されました
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mb-4">
                      Supabaseとの接続が確認できました。データベース構築を段階的に進めています。
                    </p>
                    <div className="bg-white/30 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-800 mb-2">構築進行状況</h3>
                      <ul className="text-left space-y-1 text-xs">
                        <li className={tableStatus.find(t => t.table === 'organizations')?.exists ? 'text-emerald-600' : 'text-slate-500'}>
                          {tableStatus.find(t => t.table === 'organizations')?.exists ? '✅' : '⏳'} organizationsテーブル
                        </li>
                        <li className={tableStatus.find(t => t.table === 'users')?.exists ? 'text-emerald-600' : 'text-slate-500'}>
                          {tableStatus.find(t => t.table === 'users')?.exists ? '✅' : '⏳'} usersテーブル
                        </li>
                        <li className="text-slate-500">⏳ applicationsテーブル作成待ち</li>
                        <li className="text-slate-500">⏳ Row Level Security (RLS) 設定待ち</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {connectionStatus === 'error' && (
              <div className="text-slate-600 text-sm">
                <p className="mb-4">
                  接続に問題があります。以下をご確認ください：
                </p>
                <div className="bg-white/30 rounded-lg p-4">
                  <ul className="text-left space-y-1 text-xs">
                    <li>• Project URLが正しいか確認</li>
                    <li>• API Keyが正しいか確認</li>
                    <li>• Supabaseプロジェクトが有効か確認</li>
                    <li>• organizationsテーブルが作成されているか確認</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              © 2024 賢者の精算. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectionTest;