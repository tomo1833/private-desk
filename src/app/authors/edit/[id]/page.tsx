'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Author } from '@/types/author';

const AuthorEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/author/${id}`);
        if (res.ok) {
          const data: Author = await res.json();
          setName(data.name);
          setBio(data.bio ?? '');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/author/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio }),
    });
    if (res.ok) {
      router.push('/authors');
    } else {
      alert('更新失敗');
    }
  };

  const handleDelete = async () => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/author/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/authors');
    } else {
      alert('削除失敗');
    }
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="card-form">
      <div className="form-header">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">著者編集</h1>
        <p className="form-subtitle">著者情報の編集・更新を行います</p>
      </div>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="space-y-4 mb-6">
          <label className="form-label">名前</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="form-textarea min-h-24"
            rows={4}
          />
        </div>
        <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
          <div className="btn-group-left">
            <button
              type="button"
              onClick={() => router.push('/authors')}
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

export default AuthorEditPage;
