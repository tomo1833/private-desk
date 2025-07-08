'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Diary } from '@/types/diary';

const DiaryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [diary, setDiary] = useState<Diary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/diary/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Diary = await res.json();
        setDiary(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, [id]);

  if (error) return <div>読み込みエラー</div>;
  if (!diary) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{diary.title}</h1>
      <MarkdownRenderer className="whitespace-pre-wrap border p-4 rounded bg-white">
        {diary.content}
      </MarkdownRenderer>
      <div className="flex justify-end">
        <button onClick={() => router.push(`/diaries/edit/${diary.id}`)} className="bg-blue-500 text-white px-4 py-2 rounded">
          編集
        </button>
      </div>
    </div>
  );
};

export default DiaryDetailPage;
