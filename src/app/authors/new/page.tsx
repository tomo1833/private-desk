'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NewAuthorPage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/author', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio, display_order: displayOrder }),
    });
    if (res.ok) {
      router.push('/authors');
    } else {
      alert('登録失敗');
    }
  };

  return (
    <div className="card-form">
      <div className="form-header">
        <h1 className="form-title">著者登録</h1>
        <p className="form-subtitle">新しい著者情報を登録します</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 mb-6">
          <label className="form-label">名前</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="form-input" required />
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
          <label className="form-label">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="form-textarea min-h-24" rows={4} />
        </div>
        <div className="btn-group-between pt-4 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/authors')}
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

export default NewAuthorPage;
