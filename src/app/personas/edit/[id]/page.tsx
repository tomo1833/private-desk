'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Persona } from '@/types/persona';

const PersonaEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/persona/${id}`);
        if (res.ok) {
          const data: Persona = await res.json();
          setName(data.name);
          setDescription(data.description ?? '');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/persona/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      router.push('/personas');
    } else {
      alert('更新失敗');
    }
  };

  const handleDelete = async () => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/persona/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/personas');
    } else {
      alert('削除失敗');
    }
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">ペルソナ編集</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <div>
          <label className="block text-white">名前</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">詳細</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded bg-white"
            rows={4}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="submit" className="btn btn-primary">更新</button>
          <button type="button" onClick={handleDelete} className="btn btn-danger">削除</button>
        </div>
      </form>
    </div>
  );
};

export default PersonaEditPage;
