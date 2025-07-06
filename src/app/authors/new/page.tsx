'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NewAuthorPage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/author', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio }),
    });
    if (res.ok) {
      router.push('/authors');
    } else {
      alert('登録失敗');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">著者登録</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block">名前</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full border p-2 rounded" rows={4} />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">登録</button>
        </div>
      </form>
    </div>
  );
};

export default NewAuthorPage;
