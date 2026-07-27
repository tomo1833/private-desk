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

  if (loading) return <div className="text-center text-white p-4">読み込み中...</div>;
  if (error || !subscription) {
    return (
      <div className="space-y-4 page-wrap text-center">
        <p className="text-red-400">{error || 'データが見つかりません。'}</p>
        <Link href="/subscriptions" className="btn btn-secondary">
          一覧へ戻る
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
        <Link href="/subscriptions" className="btn btn-secondary text-sm">
          ← 一覧に戻る
        </Link>
        <div className="flex gap-2">
          <Link href={`/subscriptions/edit/${id}`} className="btn btn-primary text-sm">
            ✏️ 編集
          </Link>
          <button onClick={handleDelete} className="btn bg-red-600 hover:bg-red-700 text-white text-sm">
            🗑️ 削除
          </button>
        </div>
      </div>

      {/* カード詳細 */}
      <div className="card-basic space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-4 border-b border-gray-700">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {subscription.name}
            </h1>
            <p className="text-sm text-gray-400 mt-1">ID: {subscription.id}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              ¥{Number(subscription.price).toLocaleString()}
            </span>
            <p className="text-xs text-gray-400 mt-0.5">{getCycleText(subscription.cycle)}</p>
          </div>
        </div>

        {/* 属性グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/50">
            <span className="text-xs text-gray-400 block">ステータス</span>
            <span className="font-semibold text-white mt-1 block">
              {subscription.status === 'Active' && '🟢 契約中'}
              {subscription.status === 'Canceling' && '⚠️ 解約予定'}
              {subscription.status === 'Canceled' && '⚪ 解約済'}
              {subscription.status === 'Trial' && '🟣 お試し・検討中'}
            </span>
          </div>

          <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/50">
            <span className="text-xs text-gray-400 block">次回更新日・支払日</span>
            <span className="font-mono text-amber-400 mt-1 block font-medium">
              {subscription.next_billing || '未設定'}
            </span>
          </div>

          <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/50">
            <span className="text-xs text-gray-400 block">登録アカウント (メール)</span>
            <span className="font-mono text-white mt-1 block truncate">
              {subscription.account_email || '未設定'}
            </span>
          </div>

          <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/50">
            <span className="text-xs text-gray-400 block">公式サイト / URL</span>
            {subscription.url ? (
              <a
                href={subscription.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline mt-1 block truncate"
              >
                {subscription.url}
              </a>
            ) : (
              <span className="text-gray-500 mt-1 block">未設定</span>
            )}
          </div>
        </div>

        {/* ライセンスキーセクション */}
        {subscription.license_key && (
          <div className="bg-gray-800/90 p-4 rounded-xl border border-gray-700 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                🔑 ライセンスキー / シリアルコード
              </span>
              <button
                onClick={handleCopyKey}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition-colors"
              >
                {copiedKey ? '✓ コピーしました' : 'クリップボードにコピー'}
              </button>
            </div>
            <p className="font-mono text-base text-emerald-300 bg-gray-900/80 p-3 rounded border border-gray-800 select-all break-all">
              {subscription.license_key}
            </p>
          </div>
        )}

        {/* メモ */}
        {subscription.memo && (
          <div className="space-y-2 pt-2 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300">📝 メモ・注意事項</h3>
            <div className="bg-gray-800/60 p-4 rounded-lg text-gray-200 text-sm whitespace-pre-wrap">
              {subscription.memo}
            </div>
          </div>
        )}

        {/* タイムスタンプ情報 */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-700">
          <span>作成日時: {subscription.created_at ? new Date(subscription.created_at).toLocaleString('ja-JP') : '-'}</span>
          <span>最終更新: {subscription.updated_at ? new Date(subscription.updated_at).toLocaleString('ja-JP') : '-'}</span>
        </div>
      </div>
    </div>
  );
}
