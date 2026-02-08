'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Udemy } from '@/types/udemy';

const UdemyEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/udemy/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const udemy: Udemy = await res.json();
        setTitle(udemy.title);
        setContent(udemy.content);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/udemy/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      router.push(`/udemys/${id}`);
    } else {
      alert('更新失敗');
    }
  };

  const handleDelete = async () => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/udemy/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/udemys');
    } else {
      alert('削除失敗');
    }
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="card-form">
      <div className="form-header">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">Udemyの記録編集</h1>
        <p className="form-subtitle">記録の編集・更新を行います（Markdown対応）</p>
      </div>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="space-y-4 mb-6">
          <label className="form-label">タイトル</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" required />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">内容</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="form-textarea min-h-24" rows={6} required />
        </div>
        <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
          <div className="btn-group-left">
            <button
              type="button"
              onClick={() => router.push('/udemys')}
              className="btn btn-secondary"
            >
              キャンセル
            </button>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary">更新</button>
            <button type="button" onClick={handleDelete} className="btn btn-danger">削除</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UdemyEditPage;
