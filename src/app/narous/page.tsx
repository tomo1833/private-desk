'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import NarouCards from '@/app/components/NarouCards';
import ListControls from '@/app/components/ListControls';
import type { Narou } from '@/types/narou';

const NarouListPage = () => {
  const [narous, setNarous] = useState<Narou[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const loadNarous = async () => {
    try {
      const res = await fetch('/api/narou');
      if (!res.ok) throw new Error('読み込み失敗');
      const data: Narou[] = await res.json();
      setNarous(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadNarous();
  }, []);

  const filteredAndSortedNarous = useMemo(() => {
    if (!narous) return [];
    let list = [...narous];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
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
  }, [narous, searchQuery, sortBy]);

  const handleDelete = (id: number) => {
    setNarous((prev) => (prev ? prev.filter((n) => n.id !== id) : null));
  };

  if (error) return <div className="text-rose-400 text-center p-6 card-basic">読み込みエラー: {error}</div>;
  if (!narous) return <div className="text-center text-slate-300 p-8">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            📖 なろう小説の記録一覧
          </h1>
          <p className="text-xs text-slate-300 mt-1">Web小説・小説家になろう等の読書ログをまとめて管理できます</p>
        </div>
        <Link href="/narous/new" className="btn btn-primary text-center self-start sm:self-auto">
          ➕ 新規作成
        </Link>
      </div>

      {/* 検索・ソート・表示切替コントロール */}
      <ListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="作品名やメモで検索..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={narous.length}
        filteredCount={filteredAndSortedNarous.length}
      />

      {/* コンテンツ表示 */}
      {filteredAndSortedNarous.length === 0 ? (
        <div className="card-basic text-center py-12 text-slate-400 space-y-3">
          <p className="text-lg font-medium">該当するなろう小説記録が見つかりませんでした</p>
          <Link href="/narous/new" className="btn btn-primary inline-block text-sm">
            最初の記録を作成
          </Link>
        </div>
      ) : (
        <NarouCards narous={filteredAndSortedNarous} viewMode={viewMode} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default NarouListPage;
