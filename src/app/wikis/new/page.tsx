'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NewWikiPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/wiki', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, display_order: displayOrder }),
    });
    if (res.ok) {
      router.push('/wikis');
    } else {
      alert('登録に失敗しました');
    }
  };

  return (
    <div className="space-y-6 page-wrap max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>📚</span> Wiki新規作成
          </h1>
          <p className="text-xs text-slate-300 mt-1">新しいWikiナレッジページを作成します</p>
        </div>
        <Link href="/wikis" className="btn btn-secondary text-xs">
          ← 一覧に戻る
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card-form space-y-4 shadow-2xl border border-indigo-500/30">
        <div>
          <label className="form-label text-xs">タイトル <span className="text-rose-400">*</span></label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="form-input text-xs" required placeholder="例: Next.js開発ガイドライン" />
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
          <label className="form-label text-xs">本文内容 (Markdown対応) <span className="text-rose-400">*</span></label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="form-textarea text-xs min-h-36 font-mono" rows={8} required placeholder="ナレッジ本文を入力..." />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/80">
          <Link href="/wikis" className="btn btn-secondary text-xs px-3.5 py-1.5">
            キャンセル
          </Link>
          <button type="submit" className="btn btn-primary text-xs px-4 py-1.5">
            作成する
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewWikiPage;
