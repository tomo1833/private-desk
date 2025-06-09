'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import PasswordList from '../components/PasswordList';
import type { Password } from '@/types/password';

const MainPage = () => {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ diaries?: string; wikis?: string; passwords?: string }>({});

  const fetchData = useCallback(async <T,>(
    url: string,
    setter: (data: T) => void,
    key: keyof typeof errors
  ) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${key}の取得に失敗しました。`);
      const data: T = await response.json();
      setter(data);
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
      setErrors((prev) => ({ ...prev, [key]: (err as Error).message }));
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchData<Password[]>('/api/passwords', setPasswords, 'passwords'),
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchData]);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="p-3">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">パスワード管理</h1>
        <div className="flex space-x-4">
          <Link
            href="/passwords/new"
            className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-600 active:scale-95 transition-transform"
          >
            パスワード登録
          </Link>
        </div>
      </header>
      <section className="my-6">
        <h2 className="text-xl font-semibold">パスワード一覧</h2>
        {errors.passwords ? (
          <p className="text-red-500">{errors.passwords}</p>
        ) : passwords.length > 0 ? (
          <PasswordList passwords={passwords} />
        ) : (
          <p className="text-gray-500">登録されたパスワードがありません。</p>
        )}
      </section>
    </div>
  );
};

export default MainPage;