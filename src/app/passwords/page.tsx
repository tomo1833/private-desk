'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Password } from '@/types/password';

const PasswordListPage = () => {
  const [passwords, setPasswords] = useState<Password[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/passwords');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Password[] = await res.json();
        setPasswords(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, []);

  if (error) return <div className="text-red-500 text-center p-4">読み込みエラー: {error}</div>;
  if (!passwords) return <div className="text-center p-4">読み込み中...</div>;

  return (
    <div className="space-y-4 w-full px-2 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">🔐 パスワード一覧</h1>
        <Link href="/passwords/new" className="btn btn-primary text-center">
          新規作成
        </Link>
      </div>
      
      {passwords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {passwords.map((password) => (
            <div 
              key={password.id} 
              className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] p-4 sm:p-6 space-y-3"
            >
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                {password.site_name}
              </h2>
              
              <div className="space-y-2 text-sm">
                {password.login_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">ログインID:</span>
                    <span className="text-gray-900 dark:text-white font-mono">
                      {password.login_id}
                    </span>
                  </div>
                )}
                
                {password.site_url && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">URL:</span>
                    <a 
                      href={password.site_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]"
                    >
                      {password.site_url}
                    </a>
                  </div>
                )}
                
                {password.memo && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 text-xs line-clamp-2">
                      {password.memo}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/passwords/edit/${password.id}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  編集
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <p className="text-lg mb-4">まだパスワードが登録されていません</p>
          <Link href="/passwords/new" className="btn btn-primary inline-block">
            最初のパスワードを登録
          </Link>
        </div>
      )}
    </div>
  );
};

export default PasswordListPage;
