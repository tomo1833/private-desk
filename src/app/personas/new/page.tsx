'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NewPersonaPage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, display_order: displayOrder }),
    });
    if (res.ok) {
      router.push('/personas');
    } else {
      alert('登録失敗');
    }
  };

  return (
    <div className="space-y-6 page-wrap max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>🎭</span> ペルソナ新規登録
          </h1>
          <p className="text-xs text-slate-300 mt-1">新しいペルソナ情報を登録します</p>
        </div>
        <Link href="/personas" className="btn btn-secondary text-xs">
          ← 一覧に戻る
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card-form space-y-4 shadow-2xl border border-indigo-500/30">
        <div>
          <label className="form-label text-xs">ペルソナ名 <span className="text-rose-400">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="form-input text-xs" required placeholder="例: Web技術ライター / 読書家エンジニア" />
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
          <label className="form-label text-xs">詳細・ターゲット層 / キャラクター定義</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} 
          className="form-textarea text-xs min-h-28" rows={4} placeholder="文章トーンや読者ターゲットなど..." />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/80">
          <Link href="/personas" className="btn btn-secondary text-xs px-3.5 py-1.5">
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

export default NewPersonaPage;
