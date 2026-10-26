'use client';

import React from 'react';
import Link from 'next/link';
import type { WishlistItem } from '@/types/wishlist';

interface WishlistCardsProps {
  items: WishlistItem[];
  onStatusChange?: (id: number, newStatus: string) => void;
  onDelete?: (id: number) => void;
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'High':
      return { label: '高 ★★★', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    case 'Medium':
      return { label: '中 ★★☆', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    case 'Low':
      return { label: '低 ★☆☆', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
    default:
      return { label: priority, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Wanted':
      return { label: '欲しい', icon: '🎁', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
    case 'Considering':
      return { label: '検討中', icon: '🤔', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    case 'Purchased':
      return { label: '購入済み', icon: '✅', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    case 'Archived':
      return { label: '見送り', icon: '📦', color: 'bg-gray-500/20 text-gray-400 border-gray-500/40' };
    default:
      return { label: status, icon: '📌', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
  }
};

export const WishlistCards: React.FC<WishlistCardsProps> = ({
  items,
  onStatusChange,
  onDelete,
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center text-slate-400 py-12 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
        <p className="text-4xl mb-3">🎁</p>
        <p className="text-lg font-medium text-slate-300 mb-1">該当するアイテムがありません</p>
        <p className="text-xs text-slate-500">新しい欲しいものを追加してみてください</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const priorityInfo = getPriorityBadge(item.priority);
        const statusInfo = getStatusBadge(item.status);
        const imageUrl = item.image_url || item.imageUrl;

        return (
          <div
            key={item.id}
            className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 p-4 hover:border-indigo-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="space-y-3">
              {/* アイテム画像 (登録があれば表示) */}
              {imageUrl && (
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-950/60 border border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* ヘッダー: カテゴリ & ステータス & 優先度 */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium truncate max-w-[120px]">
                  {item.category || 'その他'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                    <span>{statusInfo.icon}</span>
                    <span>{statusInfo.label}</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${priorityInfo.color}`}>
                    {priorityInfo.label}
                  </span>
                </div>
              </div>

              {/* タイトル */}
              <div>
                <Link
                  href={`/wishlists/${item.id}`}
                  className="font-bold text-slate-100 text-base group-hover:text-indigo-300 transition-colors line-clamp-2 block"
                >
                  {item.title}
                </Link>
              </div>

              {/* 価格表示 */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-slate-400 font-medium">予想価格:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  ¥{(item.price || 0).toLocaleString()}
                </span>
              </div>

              {/* メモプレビュー */}
              {item.memo && (
                <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 whitespace-pre-wrap">
                  {item.memo}
                </p>
              )}
            </div>

            {/* フッターアクション */}
            <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              {/* ステータスクイック変更 */}
              {onStatusChange ? (
                <select
                  value={item.status}
                  onChange={(e) => onStatusChange(item.id, e.target.value)}
                  className="text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 outline-none focus:border-indigo-500"
                >
                  <option value="Wanted">🎁 欲しい</option>
                  <option value="Considering">🤔 検討中</option>
                  <option value="Purchased">✅ 購入済み</option>
                  <option value="Archived">📦 見送り</option>
                </select>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-2">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors flex items-center gap-1"
                    title="商品ページを開く"
                  >
                    🔗
                  </a>
                )}
                <Link
                  href={`/wishlists/edit/${item.id}`}
                  className="p-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors"
                  title="編集"
                >
                  ✏️
                </Link>
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm(`「${item.title}」を削除してもよろしいですか？`)) {
                        onDelete(item.id);
                      }
                    }}
                    className="p-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
                    title="削除"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WishlistCards;
