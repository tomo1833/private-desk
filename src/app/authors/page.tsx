'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Author } from '@/types/author';

const AuthorListPage = () => {
  const [authors, setAuthors] = useState<Author[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/author');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Author[] = await res.json();
        setAuthors(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, []);

  if (error) return <div>読み込みエラー</div>;
  if (!authors) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">著者一覧</h1>
      <Link href="/authors/new" className="bg-blue-500 text-white px-4 py-2 rounded">新規作成</Link>
      <ul className="space-y-2">
        {authors.map((a) => (
          <li key={a.id} className="border p-2 rounded">
            <p className="font-semibold">{a.name}</p>
            {a.bio && <p className="text-sm">{a.bio}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuthorListPage;
