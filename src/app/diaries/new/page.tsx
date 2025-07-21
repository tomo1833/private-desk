'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NewDiaryPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      router.push('/diaries');
    } else {
      alert('登録失敗');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">日報作成</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block">タイトル</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block">内容</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full border p-2 rounded" rows={6} required />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">登録</button>
        </div>
      </form>
    </div>
  );
};

export default NewDiaryPage;
