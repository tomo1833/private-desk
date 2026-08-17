'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
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

  if (error) return <div className="page-wrap p-8 text-center text-rose-400 card-basic">読み込みエラー: {error}</div>;
  if (!wiki) return <div className="page-wrap p-8 text-center text-slate-300 card-basic">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap max-w-4xl mx-auto">
      {/* ページヘッダー & 操作ボタン */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>📚</span> {wiki.title}
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">Wiki ID: {wiki.id}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/wikis" className="btn btn-secondary text-xs">
            ← 一覧に戻る
          </Link>
          <button
            onClick={() => router.push(`/wikis/edit/${wiki.id}`)}
            className="btn btn-primary text-xs"
          >
            ✏️ 編集
          </button>
        </div>
      </div>

      {/* 本文カード */}
      <div className="card-basic p-6 sm:p-8 space-y-4">
        <MarkdownRenderer className="whitespace-pre-wrap text-slate-100 text-sm sm:text-base leading-relaxed">
          {wiki.content}
        </MarkdownRenderer>
      </div>
    </div>
  );
};

export default WikiDetailPage;
