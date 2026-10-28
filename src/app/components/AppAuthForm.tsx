'use client';

import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';

type Props = { mode: 'login' | 'setup' };

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/';
  }
  return value;
}

export default function AppAuthForm({ mode }: Props) {
  const searchParams = useSearchParams();
  const [passphrase, setPassphrase] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/app-auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase, ...(mode === 'setup' ? { setupToken } : {}) }),
        cache: 'no-store',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? '認証に失敗しました。');
      window.location.assign(
        mode === 'setup' ? '/' : getSafeNextPath(searchParams.get('next'))
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '認証に失敗しました。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card-form mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-100">
          {mode === 'setup' ? '管理者認証を初期設定' : 'Private Desk にログイン'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {mode === 'setup'
            ? '初回設定トークンと、16文字以上の一意な管理者パスワードを入力してください。'
            : '管理者パスワードを入力してください。'}
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {mode === 'setup' && (
          <label className="block">
            <span className="form-label">初回設定トークン</span>
            <input
              type="password"
              autoComplete="off"
              required
              value={setupToken}
              onChange={(event) => setSetupToken(event.target.value)}
              className="form-input"
            />
          </label>
        )}
        <label className="block">
          <span className="form-label">管理者パスワード</span>
          <input
            type="password"
            autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
            minLength={mode === 'setup' ? 16 : undefined}
            maxLength={1024}
            required
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
            className="form-input"
          />
        </label>
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? '処理中...' : mode === 'setup' ? '認証を設定' : 'ログイン'}
        </button>
      </form>
    </section>
  );
}
