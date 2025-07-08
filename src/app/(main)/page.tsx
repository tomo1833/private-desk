'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import PasswordList from '../components/PasswordList';
import WikiCards from '../components/WikiCards';
import DiaryCards from '../components/DiaryCards';
import BlogCards from '../components/BlogCards';
import ScheduleCalendar from '../components/ScheduleCalendar';
import type { Password } from '@/types/password';
import type { Wiki } from '@/types/wiki';
import type { Diary } from '@/types/diary';
import type { Blog } from '@/types/blog';
import type { Expense } from '@/types/expense';

const MainPage = () => {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [wikis, setWikis] = useState<Wiki[]>([]);
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthTotal, setMonthTotal] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [errors, setErrors] = useState<{
    diaries?: string;
    wikis?: string;
    passwords?: string;
    blogs?: string;
  }>({});

  const fetchData = useCallback(
    async <T,>(url: string, setter: (data: T) => void, key: keyof typeof errors) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${key}の取得に失敗しました。`);
        const data: T = await response.json();
        setter(data);
      } catch (err) {
        console.error(`Error fetching ${key}:`, err);
        setErrors((prev) => ({ ...prev, [key]: (err as Error).message }));
      }
    },
    [],
  );

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchData<Password[]>('/api/passwords', setPasswords, 'passwords'),
        fetchData<Wiki[]>('/api/wiki?limit=5', setWikis, 'wikis'),
        fetchData<Diary[]>('/api/diary?limit=3', setDiaries, 'diaries'),
        fetchData<Blog[]>('/api/blog?limit=2', setBlogs, 'blogs'),
      ]);
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const res = await fetch(`/api/expense?month=${month}`);
      if (res.ok) {
        const data: Expense[] = await res.json();
        const mTotal = data.reduce((sum, e) => sum + e.amount, 0);
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const tTotal = data.filter(e => e.used_at === todayStr).reduce((s, e) => s + e.amount, 0);
        setMonthTotal(mTotal);
        setTodayTotal(tTotal);
      }
      setLoading(false);
    };
    loadData();
  }, [fetchData]);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-100 p-4 rounded">
        <p>本日の支出: ¥{todayTotal}</p>
        <p>今月の支出: ¥{monthTotal}</p>
      </div>
      <div className="flex justify-end space-x-2">
        <Link href="/wikis/new" className="bg-blue-500 text-white px-3 py-2 rounded">
          Wiki登録
        </Link>
        <Link href="/diaries/new" className="bg-purple-500 text-white px-3 py-2 rounded">
          日報登録
        </Link>
        <Link href="/blogs/new" className="bg-indigo-500 text-white px-3 py-2 rounded">
          ブログ登録
        </Link>
        <Link href="/passwords/new" className="bg-green-500 text-white px-3 py-2 rounded">
          パスワード登録
        </Link>
        <Link href="/files" className="bg-gray-500 text-white px-3 py-2 rounded">
          ファイル管理
        </Link>
        <Link href="/expenses" className="bg-yellow-500 text-white px-3 py-2 rounded">
          家計簿
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側：Wiki / 日報 / ブログ */}
        <div className="lg:col-span-2 space-y-6">

          <section>
            <h2 className="text-xl font-semibold">最新日報</h2>
            {errors.diaries ? (
              <p className="text-red-500">{errors.diaries}</p>
            ) : diaries.length > 0 ? (
              <DiaryCards
                diaries={diaries}
                onDelete={(id) => setDiaries(diaries.filter((d) => d.id !== id))}
              />
            ) : (
              <p className="text-gray-500">登録された日報がありません。</p>
            )}
            <div className="mt-2">
              <Link href="/diaries" className="text-blue-600 hover:underline">
                一覧を見る
              </Link>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">最新Wiki</h2>
            {errors.wikis ? (
              <p className="text-red-500">{errors.wikis}</p>
            ) : wikis.length > 0 ? (
              <WikiCards wikis={wikis} />
            ) : (
              <p className="text-gray-500">登録されたWikiがありません。</p>
            )}
            <div className="mt-2">
              <Link href="/wikis" className="text-blue-600 hover:underline">
                一覧を見る
              </Link>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">最新ブログ</h2>
            {errors.blogs ? (
              <p className="text-red-500">{errors.blogs}</p>
            ) : blogs.length > 0 ? (
              <BlogCards
                blogs={blogs}
                onDelete={(id) => setBlogs(blogs.filter((b) => b.id !== id))}
              />
            ) : (
              <p className="text-gray-500">登録されたブログがありません。</p>
            )}
            <div className="mt-2">
              <Link href="/blogs" className="text-blue-600 hover:underline">
                一覧を見る
              </Link>
            </div>
          </section>
        </div>

        {/* 右側：カレンダー */}
        <div>
          <h2 className="text-xl font-semibold mb-2">予定カレンダー</h2>
          <ScheduleCalendar />
        </div>

        {/* 下段：全幅パスワード一覧 */}
        <div className="lg:col-span-3">
          <section>
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
      </div>
    </div>
  );
};

export default MainPage;
