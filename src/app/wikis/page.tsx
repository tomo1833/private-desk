'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Wiki } from '@/types/wiki';

const WikiListPage = () => {
  const [wikis, setWikis] = useState<Wiki[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/wiki');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Wiki[] = await res.json();
        setWikis(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, []);

  if (error) return <div>読み込みエラー</div>;
  if (!wikis) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4 page-wrap">
      <h1 className="text-2xl font-bold text-white">Wiki一覧</h1>
      <div className="flex justify-end my-4">
        <Link href="/wikis/new" className="btn btn-primary">
          新規作成
        </Link>
      </div>
      <ul className="wiki-grid">
        {wikis.map((wiki) => (
          <li key={wiki.id} className="sticky-note">
            <Link href={`/wikis/${wiki.id}`} className="sticky-note-title block">
              {wiki.title}
            </Link>
            <span className="sticky-note-date">
              {new Date(wiki.created_at).toLocaleDateString('ja-JP')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WikiListPage;
