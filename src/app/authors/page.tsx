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
    <div className="space-y-6 page-wrap max-w-5xl mx-auto">
      <div className="flex justify-between items-center my-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">著者一覧</h1>
        <Link href="/authors/new" className="btn btn-primary">新規作成</Link>
      </div>
      {authors.length === 0 ? (
        <div className="card-basic text-center py-12 text-gray-400">
          登録されている著者がありません
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((a) => (
            <li key={a.id} className="card-basic flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <p className="font-bold text-lg text-gray-900 dark:text-white">{a.name}</p>
                {a.bio && (
                  <MarkdownRenderer className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">{a.bio}</MarkdownRenderer>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Link href={`/authors/edit/${a.id}`} className="btn btn-sm btn-success">
                  編集
                </Link>
                <button onClick={() => handleDelete(a.id)} className="btn btn-sm btn-danger">
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AuthorListPage;
