'use client';

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';

type VaultStatus = { configured: boolean; unlocked: boolean };

export default function PasswordVaultGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadStatus = useCallback(async (): Promise<VaultStatus> => {
    const response = await fetch('/api/password-vault/session', {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('状態の確認に失敗しました。');
    return response.json();
  }, []);

  useEffect(() => {
    let active = true;
    loadStatus()
      .then((result) => {
        if (active) setStatus(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : '状態の確認に失敗しました。');
        }
      });
    return () => {
      active = false;
    };
  }, [loadStatus]);

  const refreshStatus = async () => {
    setStatus(await loadStatus());
  };

  useEffect(() => {
    if (!status?.unlocked) return;
    let timeout: number;
    const resetIdleTimeout = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        fetch('/api/password-vault/logout', { method: 'POST' })
          .catch((cause: unknown) => console.error('Failed to lock password vault:', cause))
          .finally(() => {
            setStatus({ configured: true, unlocked: false });
          });
      }, 30 * 60 * 1000);
    };
    const events = ['pointerdown', 'keydown', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetIdleTimeout));
    resetIdleTimeout();
    return () => {
      window.clearTimeout(timeout);
      events.forEach((event) => window.removeEventListener(event, resetIdleTimeout));
    };
  }, [status?.unlocked]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!status?.configured && passphrase !== confirmation) {
      setError('確認用のパスワードが一致しません。');
      return;
    }

    setBusy(true);
    try {
      const endpoint = status?.configured
        ? '/api/password-vault/unlock'
        : '/api/password-vault/setup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? '認証に失敗しました。');
      setPassphrase('');
      setConfirmation('');
      await refreshStatus();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '認証に失敗しました。');
    } finally {
      setBusy(false);
    }
  };

  const handleLock = async () => {
    try {
      await fetch('/api/password-vault/logout', { method: 'POST' });
      await refreshStatus();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ロックに失敗しました。');
    }
  };

  if (!status) {
    return (
      <div role="status" className="card-basic mx-auto max-w-lg p-6 text-center">
        パスワード保管庫を確認しています...
      </div>
    );
  }

  if (!status.unlocked) {
    return (
      <section className="card-form mx-auto max-w-lg space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            {status.configured ? 'パスワード保管庫を開く' : '保管庫を初期設定'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {status.configured
              ? 'マスターパスワードを入力してください。'
              : '12文字以上のマスターパスワードを設定してください。忘れると保存したパスワードを復元できません。'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="form-label">マスターパスワード</span>
            <input
              type="password"
              autoComplete={status.configured ? 'current-password' : 'new-password'}
              minLength={12}
              required
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              className="form-input"
            />
          </label>
          {!status.configured && (
            <label className="block">
              <span className="form-label">確認用</span>
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="form-input"
              />
            </label>
          )}
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            {busy ? '処理中...' : status.configured ? 'ロック解除' : '保管庫を作成'}
          </button>
        </form>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      <div className="flex justify-end">
        <button type="button" onClick={handleLock} className="btn btn-secondary text-xs">
          保管庫をロック
        </button>
      </div>
      {children}
    </div>
  );
}
