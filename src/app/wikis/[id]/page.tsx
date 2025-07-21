'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Wiki } from '@/types/wiki';

const WikiDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [wiki, setWiki] = useState<Wiki | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/wiki/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Wiki = await res.json();
        setWiki(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, [id]);

  if (error) return <div>読み込みエラー</div>;
  if (!wiki) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{wiki.title}</h1>
      <MarkdownRenderer className="whitespace-pre-wrap border p-4 rounded bg-white">
        {wiki.content}
      </MarkdownRenderer>
      <div className="flex justify-end">
        <button
          onClick={() => router.push(`/wikis/edit/${wiki.id}`)}
          className="btn btn-primary"
        >
          編集
        </button>
      </div>
    </div>
  );
};

export default WikiDetailPage;
