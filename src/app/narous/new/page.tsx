'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NewNarouPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/narou', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, display_order: displayOrder }),
    });
    if (res.ok) {
      router.push('/narous');
    } else {
      alert('登録失敗');
    }
  };

  return (
    <div className="card-form">
      <div className="form-header">
        <h1 className="form-title">なろう小説の記録作成</h1>
        <p className="form-subtitle">タイトルと本文をMarkdownで記録できます</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 mb-6">
          <label className="form-label">タイトル</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" required />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">表示順</label>
          <input
            type="number"
            min={0}
            step={1}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="form-input"
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">内容</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="form-textarea min-h-24" rows={6} required />
        </div>
        <div className="btn-group-between pt-4 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/narous')}
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

export default NewNarouPage;
