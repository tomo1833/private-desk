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
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!password) {
    return <div>データが見つかりません</div>;
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">パスワード編集</h1>
        <p className="form-subtitle">パスワード情報の編集・更新を行います</p>
      </div>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="form-section">
          <label className="form-label" htmlFor="category">カテゴリ</label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="siteName">サイト名</label>
          <input
            id="siteName"
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="siteUrl">サイトURL</label>
          <input
            id="siteUrl"
            type="text"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="loginId">ログインID</label>
          <input
            id="loginId"
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="password">パスワード</label>
          <input
            id="password"
            type="text"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="memo">メモ</label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="form-textarea"
            rows={6}
          />
        </div>
        <div className="btn-group-between pt-4 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="btn btn-secondary"
          >
            キャンセル
          </button>
          <button type="submit" className="btn btn-primary">
            更新
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePasswordPage;
