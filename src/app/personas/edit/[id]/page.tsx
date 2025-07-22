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
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 space-y-6 border border-white/40 shadow-lg">
      <div className="form-header">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">ペルソナ編集</h1>
        <p className="form-subtitle">ペルソナ情報の編集・更新を行います</p>
      </div>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">名前</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
            required
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">詳細</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 min-h-24 resize-vertical"
            rows={4}
          />
        </div>
        <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
          <div className="btn-group-left">
            <button
              type="button"
              onClick={() => router.push('/personas')}
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

export default PersonaEditPage;
