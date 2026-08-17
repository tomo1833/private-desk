'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import type { Author } from '@/types/author';

const AuthorEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/author/${id}`);
        if (res.ok) {
          const data: Author = await res.json();
          setName(data.name);
          setBio(data.bio ?? '');
          setDisplayOrder(data.display_order ?? 0);
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
      body: JSON.stringify({ name, bio, display_order: displayOrder }),
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

  if (loading) return <div className="page-wrap p-8 text-center text-slate-300 card-basic">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>✏️</span> 著者情報編集
          </h1>
          <p className="text-xs text-slate-300 mt-1">著者プロフィールの変更・削除を行います</p>
        </div>
        <Link href="/authors" className="btn btn-secondary text-xs">
          ← 一覧に戻る
        </Link>
      </div>

      <form onSubmit={handleUpdate} className="card-form space-y-4 shadow-2xl border border-indigo-500/30">
        <div>
          <label className="form-label text-xs">名前 <span className="text-rose-400">*</span></label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input text-xs"
            required
          />
        </div>

        <div>
          <label className="form-label text-xs">表示順</label>
          <input
            type="number"
            min={0}
            step={1}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="form-input text-xs font-mono"
          />
        </div>

        <div>
          <label className="form-label text-xs">プロフィール / 経歴 (Markdown対応)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="form-textarea text-xs min-h-28"
            rows={4}
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-700/80">
          <Link href="/authors" className="btn btn-secondary text-xs px-3.5 py-1.5">
            キャンセル
          </Link>
          <div className="flex gap-2">
            <button type="button" onClick={handleDelete} className="btn btn-danger text-xs px-3.5 py-1.5">
              削除
            </button>
            <button type="submit" className="btn btn-primary text-xs px-4 py-1.5">
              更新する
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AuthorEditPage;
