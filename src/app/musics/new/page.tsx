'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NewMusicPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, display_order: displayOrder }),
    });
    if (res.ok) {
      router.push('/musics');
    } else {
      alert('登録失敗');
    }
  };

  return (
    <div className="space-y-6 page-wrap max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>🎵</span> 音楽記録新規作成
          </h1>
          <p className="text-xs text-slate-300 mt-1">楽曲やアルバムのメモ・感想を記録します</p>
        </div>
        <Link href="/musics" className="btn btn-secondary text-xs">
          ← 一覧に戻る
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card-form space-y-4 shadow-2xl border border-indigo-500/30">
        <div>
          <label className="form-label text-xs">楽曲 / アルバム名 <span className="text-rose-400">*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-input text-xs" required placeholder="楽曲・アルバムのタイトルを入力..." />
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
          <label className="form-label text-xs">感想・レビュー (Markdown対応) <span className="text-rose-400">*</span></label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="form-textarea text-xs min-h-36" rows={6} required placeholder="曲の魅力や感想を記録..." />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/80">
          <Link href="/musics" className="btn btn-secondary text-xs px-3.5 py-1.5">
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

export default NewMusicPage;
