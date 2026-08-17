'use client';
import React, { useState } from 'react';
import type { Password } from '@/types/password';
import { useRouter } from 'next/navigation';

type Props = {
  passwords: Password[];
  viewMode?: 'card' | 'table';
};

const PasswordCards: React.FC<Props> = ({ passwords, viewMode = 'card' }) => {
  const router = useRouter();
  const [visiblePasswordId, setVisiblePasswordId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handlePasswordClick = (password: string, id: number) => {
    setVisiblePasswordId(visiblePasswordId === id ? null : id);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(password);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (viewMode === 'table') {
    return (
      <div className="table-container">
        <table className="table-basic">
          <thead>
            <tr>
              <th className="table-header text-left">サイト名</th>
              <th className="table-header text-left">サイトURL</th>
              <th className="table-header text-left">ログインID</th>
              <th className="table-header text-center">パスワード (クリックでコピー)</th>
              <th className="table-header text-left">メールアドレス</th>
              <th className="table-header text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {passwords.map((p) => (
              <tr key={p.id} className="table-row">
                <td className="table-cell font-semibold text-slate-100">🔐 {p.site_name}</td>
                <td className="table-cell">
                  {p.site_url ? (
                    <a
                      href={p.site_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium text-xs"
                    >
                      {p.site_url}
                    </a>
                  ) : (
                    <span className="text-slate-500 text-xs">-</span>
                  )}
                </td>
                <td className="table-cell font-mono text-slate-200 text-xs">{p.login_id ?? '-'}</td>
                <td className="table-cell text-center">
                  <button
                    onClick={() => handlePasswordClick(p.password, p.id)}
                    className="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-mono transition-colors"
                    title="クリックで表示・コピー"
                  >
                    {copiedId === p.id
                      ? '✓ コピー完了'
                      : visiblePasswordId === p.id
                      ? p.password
                      : '••••••••••••'}
                  </button>
                </td>
                <td className="table-cell font-mono text-slate-300 text-xs">{p.email ?? '-'}</td>
                <td className="table-cell text-right">
                  <button
                    onClick={() => router.push(`/passwords/edit/${p.id}`)}
                    className="btn btn-secondary text-xs px-3 py-1"
                  >
                    編集
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
      {passwords.map((p) => (
        <div
          key={p.id}
          className="card-basic group flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-emerald-500/40 hover:-translate-y-1 space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm shrink-0">
                🔐
              </span>
              <h3 className="font-bold text-base text-slate-100 group-hover:text-emerald-300 transition-colors truncate flex-1">
                {p.site_name}
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              {p.login_id && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">ID:</span>
                  <span className="font-mono text-slate-200 font-medium">{p.login_id}</span>
                </div>
              )}
              {p.password && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">パスワード:</span>
                  <button
                    onClick={() => handlePasswordClick(p.password, p.id)}
                    className="text-xs font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 transition-colors"
                  >
                    {copiedId === p.id
                      ? '✓ コピー完了'
                      : visiblePasswordId === p.id
                      ? p.password
                      : '•••••••••••• (コピー)'}
                  </button>
                </div>
              )}
              {p.site_url && (
                <div className="flex items-center justify-between text-slate-300 truncate">
                  <span className="text-slate-400">URL:</span>
                  <a
                    href={p.site_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-indigo-400 hover:underline truncate max-w-[180px]"
                  >
                    {p.site_url}
                  </a>
                </div>
              )}
              {p.memo && (
                <div className="pt-2 border-t border-slate-700/60">
                  <p className="text-slate-400 line-clamp-2">{p.memo}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-700/80">
            <button
              onClick={() => router.push(`/passwords/edit/${p.id}`)}
              className="btn btn-secondary text-xs px-3 py-1.5"
            >
              詳細・編集 →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PasswordCards;
