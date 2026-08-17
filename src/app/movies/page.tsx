'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import MovieCards from '@/app/components/MovieCards';
import ListControls from '@/app/components/ListControls';
import type { Movie } from '@/types/movie';

const MovieListPage = () => {
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const loadMovies = async () => {
    try {
      const res = await fetch('/api/movie');
      if (!res.ok) throw new Error('読み込み失敗');
      const data: Movie[] = await res.json();
      setMovies(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const filteredAndSortedMovies = useMemo(() => {
    if (!movies) return [];
    let list = [...movies];

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
  }, [movies, searchQuery, sortBy]);

  const handleDelete = (id: number) => {
    setMovies((prev) => (prev ? prev.filter((m) => m.id !== id) : null));
  };

  if (error) return <div className="text-rose-400 text-center p-6 card-basic">読み込みエラー: {error}</div>;
  if (!movies) return <div className="text-center text-slate-300 p-8">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            🎞 映画の記録一覧
          </h1>
          <p className="text-xs text-slate-300 mt-1">鑑賞した映画の感想・レビューをまとめて管理できます</p>
        </div>
        <Link href="/movies/new" className="btn btn-primary text-center self-start sm:self-auto">
          ➕ 新規作成
        </Link>
      </div>

      {/* 検索・ソート・表示切替コントロール */}
      <ListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="作品名や感想で検索..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={movies.length}
        filteredCount={filteredAndSortedMovies.length}
      />

      {/* コンテンツ表示 */}
      {filteredAndSortedMovies.length === 0 ? (
        <div className="card-basic text-center py-12 text-slate-400 space-y-3">
          <p className="text-lg font-medium">該当する映画記録が見つかりませんでした</p>
          <Link href="/movies/new" className="btn btn-primary inline-block text-sm">
            最初の記録を作成
          </Link>
        </div>
      ) : (
        <MovieCards movies={filteredAndSortedMovies} viewMode={viewMode} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default MovieListPage;
