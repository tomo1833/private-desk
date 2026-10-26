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

  useEffect(() => {
    let isMounted = true;

    const loadItems = async () => {
      try {
        const res = await fetch('/api/wishlist');
        if (!res.ok) throw new Error('データ取得に失敗しました');
        const data: WishlistItem[] = await res.json();
        if (isMounted) setItems(data);
      } catch (err) {
        console.error(err);
        if (isMounted) setError((err as Error).message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadItems();
    return () => {
      isMounted = false;
    };
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
    <div className="space-y-6 page-wrap">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-xl">🎁</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
              ほしいものリスト
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            買いたいもの・欲しいアイテムの優先度、見積金額、購入状態を一括管理します
          </p>
        </div>
        <Link href="/wishlists/new" className="btn btn-primary whitespace-nowrap">
          <span aria-hidden="true">＋</span> 欲しいものを追加
        </Link>
      </div>

      <section aria-label="ほしいものの集計">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="card-basic min-w-0 space-y-1.5 p-3 sm:space-y-2 sm:p-4">
            <div className="flex items-center justify-between gap-1 text-xs font-medium text-slate-300 sm:text-sm">
              <span className="truncate">欲しい</span>
              <span className="shrink-0 text-[10px] text-slate-400 sm:text-xs">{summary.wantedCount} 件</span>
            </div>
            <p className="truncate text-sm font-semibold tracking-tight text-slate-100 sm:text-2xl">
              ¥{summary.wantedTotal.toLocaleString()}
            </p>
          </div>

          <div className="card-basic min-w-0 space-y-1.5 p-3 sm:space-y-2 sm:p-4">
            <div className="flex items-center justify-between gap-1 text-xs font-medium text-slate-300 sm:text-sm">
              <span className="truncate">検討中</span>
              <span className="shrink-0 text-[10px] text-slate-400 sm:text-xs">{summary.consideringCount} 件</span>
            </div>
            <p className="truncate text-sm font-semibold tracking-tight text-slate-100 sm:text-2xl">
              ¥{summary.consideringTotal.toLocaleString()}
            </p>
          </div>

          <div className="card-basic min-w-0 space-y-1.5 p-3 sm:space-y-2 sm:p-4">
            <div className="flex items-center justify-between gap-1 text-xs font-medium text-slate-300 sm:text-sm">
              <span className="truncate">購入済み</span>
              <span className="shrink-0 text-[10px] text-slate-400 sm:text-xs">{summary.purchasedCount} 件</span>
            </div>
            <p className="truncate text-sm font-semibold tracking-tight text-slate-100 sm:text-2xl">
              ¥{summary.purchasedTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      <section aria-label="ほしいものの検索と絞り込み" className="card-basic space-y-4">
        <div className="relative">
          <label htmlFor="wishlist-search" className="sr-only">
            商品名やメモを検索
          </label>
          <input
            id="wishlist-search"
            type="search"
            placeholder="商品名やメモを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select
            aria-label="ステータスで絞り込む"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select text-sm"
          >
            <option value="ALL">すべてのステータス</option>
            <option value="Wanted">🎁 欲しい</option>
            <option value="Considering">🤔 検討中</option>
            <option value="Purchased">✅ 購入済み</option>
            <option value="Archived">📦 見送り</option>
          </select>

          <select
            aria-label="カテゴリで絞り込む"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select text-sm"
          >
            <option value="ALL">すべてのカテゴリ</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            aria-label="並び順"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'priority' | 'price_desc' | 'price_asc' | 'created')}
            className="form-select text-sm"
          >
            <option value="priority">優先度が高い順</option>
            <option value="price_desc">価格が高い順</option>
            <option value="price_asc">価格が安い順</option>
            <option value="created">登録日時が新しい順</option>
          </select>
        </div>
        <p role="status" aria-live="polite" className="text-xs text-slate-400">
          {filteredItems.length === items.length
            ? `全 ${items.length} 件`
            : `${filteredItems.length} / ${items.length} 件を表示`}
        </p>
      </section>

      {/* メインカードグリッド表示 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p role="status" className="text-slate-400 text-sm animate-pulse">読み込み中...</p>
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-rose-800/50 bg-rose-950/40 p-6 text-center text-rose-200">
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
