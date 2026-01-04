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

  if (error) return <div className="text-red-500 text-center p-4">読み込みエラー</div>;
  if (!diaries) return <div className="text-center p-4">読み込み中...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">日報一覧</h1>
        <Link href="/diaries/new" className="btn btn-primary text-center">
          新規作成
        </Link>
      </div>
      
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {diaries.map((diary) => (
          <li 
            key={diary.id} 
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-white/40 dark:border-gray-700/40 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] p-4 sm:p-6 space-y-3"
          >
            <Link 
              href={`/diaries/${diary.id}`} 
              className="font-semibold text-lg hover:underline block text-gray-900 dark:text-white line-clamp-2"
            >
              {diary.title}
            </Link>
            <MarkdownRenderer className="line-clamp-3 text-sm text-gray-700 dark:text-gray-300">
              {diary.content}
            </MarkdownRenderer>
            <div className="flex justify-end pt-2">
              <Link 
                href={`/diaries/${diary.id}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                続きを読む →
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {diaries.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <p className="text-lg mb-4">まだ日記がありません</p>
          <Link href="/diaries/new" className="btn btn-primary inline-block">
            最初の日記を作成
          </Link>
        </div>
      )}
    </div>
  );
};

export default DiaryListPage;
