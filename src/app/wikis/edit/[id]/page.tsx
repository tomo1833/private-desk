'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Wiki } from '@/types/wiki';

const WikiEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/wiki/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const wiki: Wiki = await res.json();
        setTitle(wiki.title);
        setContent(wiki.content);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/wiki/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      router.push(`/wikis/${id}`);
    } else {
      alert('更新失敗');
    }
  };

  const handleDelete = async () => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/wiki/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/wikis');
    } else {
      alert('削除失敗');
    }
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Wiki編集</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <div>
          <label className="block text-white">タイトル</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded bg-white" required />
        </div>
        <div>
          <label className="block text-white">内容</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full border p-2 rounded bg-white" rows={6} required />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="submit" className="btn btn-primary">更新</button>
          <button type="button" onClick={handleDelete} className="btn btn-danger">削除</button>
        </div>
      </form>
    </div>
  );
};

export default WikiEditPage;
