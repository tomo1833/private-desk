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

  if (!q) return <div className="p-4">検索ワードを入力してください。</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!results) return <div className="p-4">検索中...</div>;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">検索結果: {q}</h1>
      <section>
        <h2 className="font-semibold mb-2">パスワード</h2>
        {results.passwords.length > 0 ? (
          <PasswordCards passwords={results.passwords} />
        ) : (
          <p>該当なし</p>
        )}
      </section>
      <section>
        <h2 className="font-semibold mb-2">Wiki</h2>
        {results.wikis.length > 0 ? (
          <WikiCards wikis={results.wikis} />
        ) : (
          <p>該当なし</p>
        )}
      </section>
      <section>
        <h2 className="font-semibold mb-2">日報</h2>
        {results.diaries.length > 0 ? (
          <DiaryCards diaries={results.diaries} />
        ) : (
          <p>該当なし</p>
        )}
      </section>
      <section>
        <h2 className="font-semibold mb-2">ブログ</h2>
        {results.blogs.length > 0 ? (
          <BlogCards blogs={results.blogs} />
        ) : (
          <p>該当なし</p>
        )}
      </section>
    </div>
  );
};

export default SearchPage;
