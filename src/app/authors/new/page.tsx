'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="space-y-6 page-wrap max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>👤</span> 著者新規登録
          </h1>
          <p className="text-xs text-slate-300 mt-1">新しい著者プロフィールを登録します</p>
        </div>
        <Link href="/authors" className="btn btn-secondary text-xs">
          ← 一覧に戻る
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card-form space-y-4 shadow-2xl border border-indigo-500/30">
        <div>
          <label className="form-label text-xs">名前 <span className="text-rose-400">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="form-input text-xs" required placeholder="著者名を入力..." />
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
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="form-textarea text-xs min-h-28" rows={4} placeholder="著者略歴や実績など..." />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/80">
          <Link href="/authors" className="btn btn-secondary text-xs px-3.5 py-1.5">
            キャンセル
          </Link>
          <button type="submit" className="btn btn-primary text-xs px-4 py-1.5">
            登録する
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewAuthorPage;
