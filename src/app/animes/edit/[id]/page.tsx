'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Anime } from '@/types/anime';

const AnimeEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/anime/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const anime: Anime = await res.json();
        setTitle(anime.title);
        setContent(anime.content);
        setDisplayOrder(anime.display_order ?? 0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/anime/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, display_order: displayOrder }),
    });
    if (res.ok) {
      router.push(`/animes/${id}`);
    } else {
      alert('更新失敗');
    }
  };

  const handleDelete = async () => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/anime/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/animes');
    } else {
      alert('削除失敗');
    }
  };

  if (loading) return <div className="page-wrap p-8 text-center text-slate-300 card-basic">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>✏️</span> アニメ記録編集
          </h1>
          <p className="text-xs text-slate-300 mt-1">記録の編集・更新を行います（Markdown対応）</p>
        </div>
        <Link href={`/animes/${id}`} className="btn btn-secondary text-xs">
          ← 詳細へ戻る
        </Link>
      </div>

      <form onSubmit={handleUpdate} className="card-form space-y-4 shadow-2xl border border-indigo-500/30">
        <div>
          <label className="form-label text-xs">タイトル <span className="text-rose-400">*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-input text-xs" required />
        </div>

        <div>
          <label className="form-label text-xs">表示順</label>
          <input
            type="number"
            min={0}
            step={1}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="form-input text-xs font-mono"
          />
        </div>

        <div>
          <label className="form-label text-xs">感想・レビュー (Markdown対応) <span className="text-rose-400">*</span></label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="form-textarea text-xs min-h-36" rows={6} required />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-700/80">
          <Link href={`/animes/${id}`} className="btn btn-secondary text-xs px-3.5 py-1.5">
            キャンセル
          </Link>
          <div className="flex gap-2">
            <button type="button" onClick={handleDelete} className="btn btn-danger text-xs px-3.5 py-1.5">
              削除
            </button>
            <button type="submit" className="btn btn-primary text-xs px-4 py-1.5">
              更新する
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AnimeEditPage;
