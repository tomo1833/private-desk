'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Password } from '@/types/password';

const UpdatePasswordPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [idState] = useState<string>(id);
  const [siteName, setSiteName] = useState('');
  const [category, setCategory] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState<Password | null>(null);
  const [pass, setPass] = useState('');
  const [email, setEmail] = useState('');
  const [memo, setMemo] = useState('');

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // IDが取得できたらパスワードデータを取得
  useEffect(() => {
    if (!idState) return;

    const fetchPassword = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/passwords/${idState}`);
        if (!response.ok) throw new Error('Failed to fetch password data');

        const data: Password = await response.json();
        setPassword(data);
        setCategory(data.category || '');
        setSiteName(data.site_name);
        setSiteUrl(data.site_url);
        setLoginId(data.login_id || '');
        setPass(data.password);
        setEmail(data.email || '');
        setMemo(data.memo || '');

      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          console.error('Error fetching password:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPassword();
  }, [idState]);


  // 更新処理
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`/api/passwords/${idState}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, siteName, siteUrl, loginId, pass, email, memo }),
      });

      if (!response.ok) throw new Error('Failed to update password');

      alert('パスワードが更新されました！');

      router.push('/'); // 更新後にメインページへ遷移
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-white text-lg">読み込み中...</div>;
  }

  if (error) {
    return <p className="text-red-400 text-center p-8 text-lg">{error}</p>;
  }

  if (!password) {
    return <div className="text-center p-8 text-white text-lg">データが見つかりません</div>;
  }

  return (
    <div className="page-wrap py-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 sm:p-8">
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">🔐 パスワード編集</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">パスワード情報の編集・更新を行います</p>
        </div>
      <form onSubmit={handleUpdate} className="space-y-5">
        <div>
          <label className="form-label text-sm" htmlFor="category">
            カテゴリ
          </label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
            placeholder="例: SNS, 銀行, ショッピング"
            required
          />
        </div>
        <div>
          <label className="form-label text-sm" htmlFor="siteName">
            サイト名
          </label>
          <input
            id="siteName"
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="form-input"
            placeholder="例: Twitter, Amazon"
            required
          />
        </div>
        <div>
          <label className="form-label text-sm" htmlFor="siteUrl">
            サイトURL
          </label>
          <input
            id="siteUrl"
            type="text"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            className="form-input"
            placeholder="https://example.com"
            required
          />
        </div>
        <div>
          <label className="form-label text-sm" htmlFor="loginId">
            ログインID
          </label>
          <input
            id="loginId"
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="form-input"
            placeholder="ユーザー名またはID"
          />
        </div>
        <div>
          <label className="form-label text-sm" htmlFor="password">
            パスワード
          </label>
          <input
            id="password"
            type="text"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="form-input font-mono"
            placeholder="パスワードを入力"
          />
        </div>
        <div>
          <label className="form-label text-sm" htmlFor="email">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="form-label text-sm" htmlFor="memo">
            メモ
          </label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="form-textarea min-h-24"
            rows={6}
            placeholder="追加情報や注意事項など"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => router.push('/passwords')}
            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            キャンセル
          </button>
          <button 
            type="submit" 
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            更新
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
