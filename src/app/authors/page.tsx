'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Author } from '@/types/author';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';

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

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/author/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAuthors(authors!.filter((a) => a.id !== id));
    } else {
      alert('削除失敗');
    }
  };

  if (error) return <div>読み込みエラー</div>;
  if (!authors) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">著者一覧</h1>
      <div className="flex justify-end my-4">
        <Link href="/authors/new" className="bg-blue-500 text-white px-4 py-2 rounded">新規作成</Link>
      </div>
      <ul className="space-y-2">
        {authors.map((a) => (
          <li key={a.id} className="border p-2 rounded space-y-1">
            <p className="font-semibold">{a.name}</p>
            {a.bio && (
              <MarkdownRenderer className="text-sm">{a.bio}</MarkdownRenderer>
            )}
            <div className="flex justify-end space-x-2">
              <Link href={`/authors/edit/${a.id}`} className="bg-green-500 text-white px-4 py-2 rounded">
                編集
              </Link>
              <button onClick={() => handleDelete(a.id)} className="bg-red-500 text-white px-4 py-2 rounded">
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuthorListPage;
