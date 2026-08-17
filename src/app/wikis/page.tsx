'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import WikiCards from '@/app/components/WikiCards';
import ListControls from '@/app/components/ListControls';
import type { Wiki } from '@/types/wiki';

const WikiListPage = () => {
  const [wikis, setWikis] = useState<Wiki[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const loadWikis = async () => {
    try {
      const res = await fetch('/api/wiki');
      if (!res.ok) throw new Error('読み込み失敗');
      const data: Wiki[] = await res.json();
      setWikis(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadWikis();
  }, []);

  const filteredAndSortedWikis = useMemo(() => {
    if (!wikis) return [];
    let list = [...wikis];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (w) => w.title.toLowerCase().includes(q) || w.content.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'ja');
      }
      return 0;
    });

    return list;
  }, [wikis, searchQuery, sortBy]);

  const handleDelete = (id: number) => {
    setWikis((prev) => (prev ? prev.filter((w) => w.id !== id) : null));
  };

  if (error) return <div className="text-rose-400 text-center p-6 card-basic">読み込みエラー: {error}</div>;
  if (!wikis) return <div className="text-center text-slate-300 p-8">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            📌 Wiki一覧
          </h1>
          <p className="text-xs text-slate-300 mt-1">ナレッジ・メモ・手順書をナレッジカードで整理できます</p>
        </div>
        <Link href="/wikis/new" className="btn btn-primary text-center self-start sm:self-auto">
          ➕ 新規作成
        </Link>
      </div>

      {/* 検索・ソート・表示切替コントロール */}
      <ListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Wikiタイトルや本文で検索..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={wikis.length}
        filteredCount={filteredAndSortedWikis.length}
      />

      {/* コンテンツ表示 */}
      {filteredAndSortedWikis.length === 0 ? (
        <div className="card-basic text-center py-12 text-slate-400 space-y-3">
          <p className="text-lg font-medium">該当するWikiが見つかりませんでした</p>
          <Link href="/wikis/new" className="btn btn-primary inline-block text-sm">
            最初のWikiを作成
          </Link>
        </div>
      ) : (
        <WikiCards wikis={filteredAndSortedWikis} viewMode={viewMode} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default WikiListPage;
