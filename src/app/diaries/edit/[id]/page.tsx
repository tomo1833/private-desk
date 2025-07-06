'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Diary } from '@/types/diary';

const DiaryEditPage = ({ params }: { params: { id: string } }) => {
  const { id } = React.use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/diary/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const diary: Diary = await res.json();
        setTitle(diary.title);
        setContent(diary.content);
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
      body: JSON.stringify({ title, content }),
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

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">日報編集</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <div>
          <label className="block">タイトル</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block">内容</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full border p-2 rounded" rows={6} required />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">更新</button>
          <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">削除</button>
        </div>
      </form>
    </div>
  );
};

export default DiaryEditPage;
