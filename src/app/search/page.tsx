'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PasswordCards from '../components/PasswordCards';
import DiaryCards from '../components/DiaryCards';
import WikiCards from '../components/WikiCards';
import BlogCards from '../components/BlogCards';
import type { Password } from '@/types/password';
import type { Diary } from '@/types/diary';
import type { Wiki } from '@/types/wiki';
import type { Blog } from '@/types/blog';

interface Results {
  passwords: Password[];
  diaries: Diary[];
  wikis: Wiki[];
  blogs: Blog[];
}

const SearchPage = () => {
  const params = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!q) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('検索に失敗しました');
        const data: Results = await res.json();
        setResults(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, [q]);

  if (!q) return <div className="p-4 text-gray-700 dark:text-gray-300">検索ワードを入力してください。</div>;
  if (error) return <div className="p-4 text-red-600 dark:text-red-400">{error}</div>;
  if (!results) return <div className="p-4 text-gray-700 dark:text-gray-300">検索中...</div>;

  return (
    <div className="page-wrap space-y-6">
      <h1 className="text-2xl font-bold text-white">検索結果: {q}</h1>
      <section>
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">パスワード</h2>
        {results.passwords.length > 0 ? (
          <PasswordCards passwords={results.passwords} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">該当なし</p>
        )}
      </section>
      <section>
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Wiki</h2>
        {results.wikis.length > 0 ? (
          <WikiCards wikis={results.wikis} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">該当なし</p>
        )}
      </section>
      <section>
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">日報</h2>
        {results.diaries.length > 0 ? (
          <DiaryCards diaries={results.diaries} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">該当なし</p>
        )}
      </section>
      <section>
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">ブログ</h2>
        {results.blogs.length > 0 ? (
          <BlogCards blogs={results.blogs} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">該当なし</p>
        )}
      </section>
    </div>
  );
};

export default SearchPage;
