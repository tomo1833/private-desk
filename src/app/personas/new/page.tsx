'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NewPersonaPage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      router.push('/personas');
    } else {
      alert('登録失敗');
    }
  };

  return (
    <div className="card-form">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">ペルソナ登録</h1>
        <p className="form-subtitle">新しいペルソナ情報を登録します</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 mb-6">
          <label className="form-label">名前</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="form-input" required />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">詳細</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} 
          className="form-textarea min-h-24" rows={4} />
        </div>
        <div className="btn-group-between pt-4 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/personas')}
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

export default NewPersonaPage;
