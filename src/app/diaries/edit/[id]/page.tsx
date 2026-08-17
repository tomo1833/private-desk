'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Diary } from '@/types/diary';

const DiaryEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/diary/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const diary: Diary = await res.json();
        setTitle(diary.title);
        setContent(diary.content);
        if (diary.date) {
          setDate(new Date(diary.date).toISOString().split('T')[0]);
        }
        setDisplayOrder(diary.display_order ?? 0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/diary/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, date, display_order: displayOrder }),
    });
    if (res.ok) {
      router.push(`/diaries/${id}`);
    } else {
      alert('更新失敗');
    }
  };

  const handleDelete = async () => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/diary/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/diaries');
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
            <span>✏️</span> 日報編集
          </h1>
          <p className="text-xs text-slate-300 mt-1">日報の編集・更新を行います（Markdown対応）</p>
        </div>
        <Link href={`/diaries/${id}`} className="btn btn-secondary text-xs">
          ← 詳細へ戻る
        </Link>
      </div>

      <form onSubmit={handleUpdate} className="card-form space-y-4 shadow-2xl border border-indigo-500/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label text-xs">タイトル <span className="text-rose-400">*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-input text-xs" required />
          </div>
          <div>
            <label className="form-label text-xs">日付 <span className="text-rose-400">*</span></label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input text-xs font-mono"
              required
            />
          </div>
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
          <label className="form-label text-xs">本文内容 (Markdown対応) <span className="text-rose-400">*</span></label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="form-textarea text-xs min-h-36 font-mono" rows={8} required />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-700/80">
          <Link href={`/diaries/${id}`} className="btn btn-secondary text-xs px-3.5 py-1.5">
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

export default DiaryEditPage;
