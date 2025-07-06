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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">ペルソナ登録</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block">名前</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block">詳細</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded" rows={4} />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">登録</button>
        </div>
      </form>
    </div>
  );
};

export default NewPersonaPage;
