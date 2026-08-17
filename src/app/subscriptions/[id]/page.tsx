'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Subscription } from '@/types/subscription';

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/subscriptions/${id}`);
        if (!res.ok) throw new Error('データの取得に失敗しました。');
        const data = await res.json();
        setSubscription(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('本当にこのソフトウェア・サブスクを削除しますか？')) return;
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('削除に失敗しました。');
      router.push('/subscriptions');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleCopyKey = () => {
    if (subscription?.license_key) {
      navigator.clipboard.writeText(subscription.license_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  if (loading) return <div className="page-wrap text-center text-slate-300 p-8 card-basic">読み込み中...</div>;
  if (error || !subscription) {
    return (
      <div className="space-y-4 page-wrap text-center p-8 card-basic">
        <p className="text-rose-400">{error || 'データが見つかりません。'}</p>
        <Link href="/subscriptions" className="btn btn-secondary text-xs">
          ← 一覧へ戻る
        </Link>
      </div>
    );
  }

  const getCycleText = (cycle: string) => {
    switch (cycle) {
      case 'monthly':
        return '月額 (Monthly)';
      case 'yearly':
        return '年額 (Yearly)';
      case 'one_time':
        return '買い切り・一括 (One-time)';
      case 'free':
        return '無料 (Free)';
      default:
        return cycle;
    }
  };

  return (
    <div className="space-y-6 page-wrap max-w-3xl mx-auto">
      {/* ナビゲーション */}
      <div className="flex justify-between items-center">
        <Link href="/subscriptions" className="btn btn-secondary text-xs">
          ← 一覧に戻る
        </Link>
        <div className="flex gap-2">
          <Link href={`/subscriptions/edit/${id}`} className="btn btn-primary text-xs">
            ✏️ 編集
          </Link>
          <button onClick={handleDelete} className="btn btn-danger text-xs">
            🗑️ 削除
          </button>
        </div>
      </div>

      {/* カード詳細 */}
      <div className="card-basic space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-4 border-b border-slate-700/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <span>💻</span> {subscription.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">ID: {subscription.id}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              ¥{Number(subscription.price).toLocaleString()}
            </span>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">{getCycleText(subscription.cycle)}</p>
          </div>
        </div>

        {/* 属性グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
            <span className="text-xs text-slate-400 block mb-1">ステータス</span>
            <span className="font-bold text-white block">
              {subscription.status === 'Active' && '🟢 契約中'}
              {subscription.status === 'Canceling' && '⚠️ 解約予定'}
              {subscription.status === 'Canceled' && '⚪ 解約済'}
              {subscription.status === 'Trial' && '🟣 お試し・検討中'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
            <span className="text-xs text-slate-400 block mb-1">次回更新日・支払日</span>
            <span className="font-mono text-amber-400 block font-bold">
              {subscription.next_billing || '未設定'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
            <span className="text-xs text-slate-400 block mb-1">登録アカウント (メール)</span>
            <span className="font-mono text-slate-200 block truncate">
              {subscription.account_email || '未設定'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
            <span className="text-xs text-slate-400 block mb-1">公式サイト / URL</span>
            {subscription.url ? (
              <a
                href={subscription.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 hover:underline block truncate font-mono"
              >
                {subscription.url}
              </a>
            ) : (
              <span className="text-slate-400 block">未設定</span>
            )}
          </div>
        </div>

        {/* ライセンスキーセクション */}
        {subscription.license_key && (
          <div className="bg-slate-900/90 p-4 rounded-xl border border-indigo-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                🔑 ライセンスキー / シリアルコード
              </span>
              <button
                onClick={handleCopyKey}
                className="btn btn-primary text-xs px-3 py-1"
              >
                {copiedKey ? '✓ コピーしました' : '📋 キーをコピー'}
              </button>
            </div>
            <p className="font-mono text-sm text-emerald-300 bg-slate-950 p-3 rounded-lg border border-slate-800 select-all break-all font-bold">
              {subscription.license_key}
            </p>
          </div>
        )}

        {/* メモ */}
        {subscription.memo && (
          <div className="space-y-2 pt-2 border-t border-slate-700/80">
            <h3 className="text-xs font-semibold text-slate-200">📝 メモ・注意事項</h3>
            <div className="bg-slate-950/60 p-4 rounded-xl text-slate-200 text-xs whitespace-pre-wrap border border-slate-800/80 leading-relaxed">
              {subscription.memo}
            </div>
          </div>
        )}

        {/* タイムスタンプ情報 */}
        <div className="flex flex-wrap justify-between items-center text-[11px] text-slate-400 pt-4 border-t border-slate-700/80 font-mono">
          <span>作成日時: {subscription.created_at ? new Date(subscription.created_at).toLocaleString('ja-JP') : '-'}</span>
          <span>最終更新: {subscription.updated_at ? new Date(subscription.updated_at).toLocaleString('ja-JP') : '-'}</span>
        </div>
      </div>
    </div>
  );
}
