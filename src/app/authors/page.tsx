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
    <div className="space-y-4 page-wrap">
      <h1 className="text-2xl sm:text-3xl font-bold text-white">著者一覧</h1>
      <div className="flex justify-end my-4">
        <Link href="/authors/new" className="btn btn-primary">新規作成</Link>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {authors.map((a) => (
          <li key={a.id} className="card-basic space-y-2">
            <p className="font-semibold">{a.name}</p>
            {a.bio && (
              <MarkdownRenderer className="text-sm">{a.bio}</MarkdownRenderer>
            )}
            <div className="flex justify-end space-x-2">
              <Link href={`/authors/edit/${a.id}`} className="btn btn-success">
                編集
              </Link>
              <button onClick={() => handleDelete(a.id)} className="btn btn-danger">
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
