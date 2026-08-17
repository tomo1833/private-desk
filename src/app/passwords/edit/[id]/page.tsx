'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Password } from '@/types/password';

const UpdatePasswordPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [siteName, setSiteName] = useState('');
  const [category, setCategory] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [loginId, setLoginId] = useState('');
  const [passwordData, setPasswordData] = useState<Password | null>(null);
  const [pass, setPass] = useState('');
  const [email, setEmail] = useState('');
  const [memo, setMemo] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPassword = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/passwords/${id}`);
        if (!response.ok) throw new Error('データ取得に失敗しました');

        const data: Password = await response.json();
        setPasswordData(data);
        setCategory(data.category || '');
        setSiteName(data.site_name);
        setSiteUrl(data.site_url);
        setLoginId(data.login_id || '');
        setPass(data.password);
        setEmail(data.email || '');
        setMemo(data.memo || '');
        setDisplayOrder(data.display_order ?? 0);

      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPassword();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`/api/passwords/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, siteName, siteUrl, loginId, pass, email, memo, display_order: displayOrder }),
      });

      if (!response.ok) throw new Error('更新に失敗しました');

      router.push('/passwords');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('更新に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (!confirm('このパスワード情報を削除しますか？')) return;
    try {
      const res = await fetch(`/api/passwords/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('削除失敗');
      router.push('/passwords');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) return <div className="page-wrap p-8 text-center text-slate-300 card-basic">読み込み中...</div>;
  if (error || !passwordData) return <div className="page-wrap p-8 text-center text-rose-400 card-basic">{error || 'データが見つかりません'}</div>;

  return (
    <div className="space-y-6 page-wrap max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>🔐</span> パスワード情報編集
          </h1>
          <p className="text-xs text-slate-300 mt-1">アカウント情報の変更・削除を行います</p>
        </div>
        <Link href="/passwords" className="btn btn-secondary text-xs">
          ← 一覧に戻る
        </Link>
      </div>

      <form onSubmit={handleUpdate} className="card-form space-y-4 shadow-2xl border border-indigo-500/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label text-xs">サイト名 <span className="text-rose-400">*</span></label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="form-input text-xs"
              required
            />
          </div>
          <div>
            <label className="form-label text-xs">カテゴリ</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input text-xs"
              placeholder="例: SNS, 銀行, ショッピング"
            />
          </div>
        </div>

        <div>
          <label className="form-label text-xs">サイトURL <span className="text-rose-400">*</span></label>
          <input
            type="text"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            className="form-input text-xs font-mono"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label text-xs">ログインID / ユーザー名</label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="form-input text-xs font-mono"
            />
          </div>
          <div>
            <label className="form-label text-xs">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label text-xs">パスワード <span className="text-rose-400">*</span></label>
            <input
              type="text"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="form-input text-xs font-mono"
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
        </div>

        <div>
          <label className="form-label text-xs">メモ・注意事項</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="form-textarea text-xs min-h-24"
            rows={4}
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-700/80">
          <Link href="/passwords" className="btn btn-secondary text-xs px-3.5 py-1.5">
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

export default UpdatePasswordPage;
