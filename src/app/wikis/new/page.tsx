'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NewWikiPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/wiki', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      router.push('/wikis');
    } else {
      alert('登録失敗');
    }
  };

  return (
    <div className="card-form">
      <div className="form-header">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">Wiki作成</h1>
        <p className="form-subtitle">新しいWikiページを作成します</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 mb-6">
          <label className="form-label">タイトル</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="form-input" required />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">内容</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="form-textarea min-h-24" rows={6} required />
        </div>
        <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/wikis')}
            className="btn btn-secondary"
          >
            キャンセル
          </button>
          <button type="submit" className="btn btn-primary">
            登録
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewWikiPage;
