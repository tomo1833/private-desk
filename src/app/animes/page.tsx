'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import AnimeCards from '@/app/components/AnimeCards';
import ListControls from '@/app/components/ListControls';
import type { Anime } from '@/types/anime';

const AnimeListPage = () => {
  const [animes, setAnimes] = useState<Anime[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const loadAnimes = async () => {
    try {
      const res = await fetch('/api/anime');
      if (!res.ok) throw new Error('読み込み失敗');
      const data: Anime[] = await res.json();
      setAnimes(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadAnimes();
  }, []);

  const filteredAndSortedAnimes = useMemo(() => {
    if (!animes) return [];
    let list = [...animes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
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
  }, [animes, searchQuery, sortBy]);

  const handleDelete = (id: number) => {
    setAnimes((prev) => (prev ? prev.filter((a) => a.id !== id) : null));
  };

  if (error) return <div className="text-rose-400 text-center p-6 card-basic">読み込みエラー: {error}</div>;
  if (!animes) return <div className="text-center text-slate-300 p-8">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            🎬 アニメ記録一覧
          </h1>
          <p className="text-xs text-slate-300 mt-1">視聴したアニメの感想・記録をまとめて管理できます</p>
        </div>
        <Link href="/animes/new" className="btn btn-primary text-center self-start sm:self-auto">
          ➕ 新規作成
        </Link>
      </div>

      {/* 検索・ソート・表示切替コントロール */}
      <ListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="タイトルや感想で検索..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={animes.length}
        filteredCount={filteredAndSortedAnimes.length}
      />

      {/* コンテンツ表示 */}
      {filteredAndSortedAnimes.length === 0 ? (
        <div className="card-basic text-center py-12 text-slate-400 space-y-3">
          <p className="text-lg font-medium">該当するアニメ記録が見つかりませんでした</p>
          <Link href="/animes/new" className="btn btn-primary inline-block text-sm">
            最初の記録を作成
          </Link>
        </div>
      ) : (
        <AnimeCards animes={filteredAndSortedAnimes} viewMode={viewMode} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default AnimeListPage;
