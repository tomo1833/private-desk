'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import MusicCards from '@/app/components/MusicCards';
import ListControls from '@/app/components/ListControls';
import type { Music } from '@/types/music';

const MusicListPage = () => {
  const [musics, setMusics] = useState<Music[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const loadMusics = async () => {
    try {
      const res = await fetch('/api/music');
      if (!res.ok) throw new Error('読み込み失敗');
      const data: Music[] = await res.json();
      setMusics(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadMusics();
  }, []);

  const filteredAndSortedMusics = useMemo(() => {
    if (!musics) return [];
    let list = [...musics];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) => m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q)
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
  }, [musics, searchQuery, sortBy]);

  const handleDelete = (id: number) => {
    setMusics((prev) => (prev ? prev.filter((m) => m.id !== id) : null));
  };

  if (error) return <div className="text-rose-400 text-center p-6 card-basic">読み込みエラー: {error}</div>;
  if (!musics) return <div className="text-center text-slate-300 p-8">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            🎵 音楽の記録一覧
          </h1>
          <p className="text-xs text-slate-300 mt-1">お気に入りの楽曲・アーティスト・アルバム記録をまとめて管理できます</p>
        </div>
        <Link href="/musics/new" className="btn btn-primary text-center self-start sm:self-auto">
          ➕ 新規作成
        </Link>
      </div>

      {/* 検索・ソート・表示切替コントロール */}
      <ListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="曲名や感想で検索..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={musics.length}
        filteredCount={filteredAndSortedMusics.length}
      />

      {/* コンテンツ表示 */}
      {filteredAndSortedMusics.length === 0 ? (
        <div className="card-basic text-center py-12 text-slate-400 space-y-3">
          <p className="text-lg font-medium">該当する音楽記録が見つかりませんでした</p>
          <Link href="/musics/new" className="btn btn-primary inline-block text-sm">
            最初の記録を作成
          </Link>
        </div>
      ) : (
        <MusicCards musics={filteredAndSortedMusics} viewMode={viewMode} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default MusicListPage;
