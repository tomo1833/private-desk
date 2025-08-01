'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Diary } from '@/types/diary';

const DiaryListPage = () => {
  const [diaries, setDiaries] = useState<Diary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/diary');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Diary[] = await res.json();
        setDiaries(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, []);

  if (error) return <div>読み込みエラー</div>;
  if (!diaries) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">日報一覧</h1>
      <div className="flex justify-end my-4">
        <Link href="/diaries/new" className="btn btn-primary">
          新規作成
        </Link>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {diaries.map((diary) => (
          <li key={diary.id} className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/40 shadow-lg transition-all duration-300 p-6 space-y-3">
            <Link href={`/diaries/${diary.id}`} className="font-semibold hover:underline block text-gray-900 dark:text-white">
              {diary.title}
            </Link>
            <MarkdownRenderer className="line-clamp-3 text-sm text-gray-700 dark:text-gray-300">
              {diary.content}
            </MarkdownRenderer>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DiaryListPage;
