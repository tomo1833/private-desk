'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { WishlistItem } from '@/types/wishlist';

export default function WishlistItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [item, setItem] = useState<WishlistItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/wishlist/${id}`);
        if (!res.ok) throw new Error('データ取得に失敗しました');
        const data = await res.json();
        setItem(data);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm(`「${item.title}」を削除してもよろしいですか？`)) return;

    try {
      const res = await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('削除に失敗しました');
      router.push('/wishlists');
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm animate-pulse">読み込み中...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-4 py-12">
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300">
          {error || 'アイテムが見つかりません'}
        </div>
        <Link href="/wishlists" className="btn btn-secondary inline-block text-xs">
          ← 一覧へ戻る
        </Link>
      </div>
    );
  }

  const imageUrl = item.image_url || item.imageUrl;

  const priorityLabel =
    item.priority === 'High'
      ? '高 ★★★'
      : item.priority === 'Medium'
      ? '中 ★★☆'
      : '低 ★☆☆';

  const statusMap: Record<string, { label: string; icon: string; color: string }> = {
    Wanted: { label: '欲しい', icon: '🎁', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    Considering: { label: '検討中', icon: '🤔', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    Purchased: { label: '購入済み', icon: '✅', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    Archived: { label: '見送り', icon: '📦', color: 'bg-gray-500/20 text-gray-400 border-gray-500/40' },
  };

  const statusInfo = statusMap[item.status] || {
    label: item.status,
    icon: '📌',
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 page-wrap">
      {/* 画面トップバー */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link href="/wishlists" className="btn btn-secondary text-xs">
          ← ほしいもの一覧へ戻る
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/wishlists/edit/${item.id}`} className="btn btn-primary text-xs">
            ✏️ 編集する
          </Link>
          <button onClick={handleDelete} className="btn bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs">
            🗑️ 削除
          </button>
        </div>
      </div>

      {/* 詳細カード */}
      <div className="card-basic space-y-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl">
        {/* メインヘッダー情報 */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
              {item.category || 'その他'}
            </span>
            <span className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${statusInfo.color}`}>
              <span>{statusInfo.icon}</span>
              <span>{statusInfo.label}</span>
            </span>
            <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-800/80 text-amber-300 text-xs font-semibold">
              優先度: {priorityLabel}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{item.title}</h1>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-sm text-slate-400">予想価格:</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              ¥{(item.price || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 画像表示 */}
        {imageUrl && (
          <div className="w-full max-h-96 rounded-2xl overflow-hidden bg-slate-950/60 border border-slate-800 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={item.title} className="max-h-96 object-contain" />
          </div>
        )}

        {/* 外部リンク */}
        {item.url && (
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-indigo-300">購入・商品リンク</div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{item.url}</p>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary text-xs whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
            >
              <span>商品ページを開く</span>
              <span>↗</span>
            </a>
          </div>
        )}

        {/* メモ */}
        {item.memo && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200">📝 メモ・検討理由</h3>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {item.memo}
            </div>
          </div>
        )}

        {/* 登録日時 */}
        <div className="text-xs text-slate-500 pt-4 border-t border-slate-800/80 flex justify-between items-center">
          <span>登録日: {item.created_at || item.createdAt ? new Date(item.created_at || item.createdAt!).toLocaleString('ja-JP') : '-'}</span>
          <span>更新日: {item.updated_at || item.updatedAt ? new Date(item.updated_at || item.updatedAt!).toLocaleString('ja-JP') : '-'}</span>
        </div>
      </div>
    </div>
  );
}
