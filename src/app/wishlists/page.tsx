'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import type { WishlistItem } from '@/types/wishlist';
import WishlistCards from '@/app/components/WishlistCards';

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // フィルター・検索・ソートステート
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'priority' | 'price_desc' | 'price_asc' | 'created'>('priority');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wishlist');
      if (!res.ok) throw new Error('データ取得に失敗しました');
      const data: WishlistItem[] = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const target = items.find((i) => i.id === id);
      if (!target) return;

      const res = await fetch(`/api/wishlist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...target,
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error('ステータスの更新に失敗しました');

      // ローカルステートを更新
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('削除に失敗しました');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // ユニークカテゴリの抽出
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  // 金額集計
  const summary = useMemo(() => {
    let wantedTotal = 0;
    let consideringTotal = 0;
    let purchasedTotal = 0;
    let wantedCount = 0;
    let consideringCount = 0;
    let purchasedCount = 0;

    items.forEach((item) => {
      const price = item.price || 0;
      if (item.status === 'Wanted') {
        wantedTotal += price;
        wantedCount++;
      } else if (item.status === 'Considering') {
        consideringTotal += price;
        consideringCount++;
      } else if (item.status === 'Purchased') {
        purchasedTotal += price;
        purchasedCount++;
      }
    });

    return {
      wantedTotal,
      consideringTotal,
      purchasedTotal,
      wantedCount,
      consideringCount,
      purchasedCount,
    };
  }, [items]);

  // フィルタリングとソート
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
        if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const titleMatch = item.title.toLowerCase().includes(q);
          const memoMatch = item.memo?.toLowerCase().includes(q) ?? false;
          const categoryMatch = item.category?.toLowerCase().includes(q) ?? false;
          if (!titleMatch && !memoMatch && !categoryMatch) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const priorityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
          const weightA = priorityWeight[a.priority] || 0;
          const weightB = priorityWeight[b.priority] || 0;
          if (weightA !== weightB) return weightB - weightA; // 高い順
          return (b.price || 0) - (a.price || 0);
        }
        if (sortBy === 'price_desc') {
          return (b.price || 0) - (a.price || 0);
        }
        if (sortBy === 'price_asc') {
          return (a.price || 0) - (b.price || 0);
        }
        if (sortBy === 'created') {
          const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
          const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
          return dateB - dateA;
        }
        return 0;
      });
  }, [items, statusFilter, categoryFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-8 page-wrap">
      {/* ページタイトル & ヘッダーアクション */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-purple-950/60 p-6 rounded-3xl border border-indigo-500/20 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎁</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              ほしいものリスト
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            買いたいもの・欲しいアイテムの優先度、見積金額、購入状態を一括管理します
          </p>
        </div>
        <Link href="/wishlists/new" className="btn btn-primary text-xs sm:text-sm whitespace-nowrap self-start sm:self-auto">
          ✨ 新しい欲しいものを追加
        </Link>
      </div>

      {/* サマリーカード（集計情報） */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold">
            <span>🎁 欲しい（未購入）</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20">{summary.wantedCount} 件</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            ¥{summary.wantedTotal.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
            <span>🤔 検討中</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20">{summary.consideringCount} 件</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-purple-200 font-mono">
            ¥{summary.consideringTotal.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
            <span>✅ 購入済み</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20">{summary.purchasedCount} 件</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-300 font-mono">
            ¥{summary.purchasedTotal.toLocaleString()}
          </p>
        </div>
      </div>

      {/* コントロールバー（検索・フィルタリング・ソート） */}
      <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* 検索入力 */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="商品名やメモを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* ステータスフィルター */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="ALL">すべてのステータス</option>
            <option value="Wanted">🎁 欲しい</option>
            <option value="Considering">🤔 検討中</option>
            <option value="Purchased">✅ 購入済み</option>
            <option value="Archived">📦 見送り</option>
          </select>

          {/* カテゴリフィルター */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="ALL">すべてのカテゴリ</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* ソート設定 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'priority' | 'price_desc' | 'price_asc' | 'created')}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="priority">優先度が高い順</option>
            <option value="price_desc">価格が高い順</option>
            <option value="price_asc">価格が安い順</option>
            <option value="created">登録日時が新しい順</option>
          </select>
        </div>
      </div>

      {/* メインカードグリッド表示 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm animate-pulse">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="text-center text-rose-400 bg-rose-950/40 border border-rose-800/50 p-6 rounded-2xl">
          {error}
        </div>
      ) : (
        <WishlistCards
          items={filteredItems}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
