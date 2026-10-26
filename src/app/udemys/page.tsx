'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import UdemyCards from '@/app/components/UdemyCards';
import ListControls from '@/app/components/ListControls';
import type { Udemy } from '@/types/udemy';

const UdemyListPage = () => {
  const [udemys, setUdemys] = useState<Udemy[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const loadUdemys = async () => {
    try {
      const res = await fetch('/api/udemy');
      if (!res.ok) throw new Error('読み込み失敗');
      const data: Udemy[] = await res.json();
      setUdemys(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadUdemys();
  }, []);

  const filteredAndSortedUdemys = useMemo(() => {
    if (!udemys) return [];
    let list = [...udemys];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) => u.title.toLowerCase().includes(q) || u.content.toLowerCase().includes(q)
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
  }, [udemys, searchQuery, sortBy]);

  const handleDelete = (id: number) => {
    setUdemys((prev) => (prev ? prev.filter((u) => u.id !== id) : null));
  };

  if (error) return <div className="text-rose-400 text-center p-6 card-basic">読み込みエラー: {error}</div>;
  if (!udemys) return <div className="text-center text-slate-300 p-8">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            🎓 Udemyの記録一覧
          </h1>
          <p className="text-xs text-slate-300 mt-1">受講コースの学習メモ・進捗ノートをまとめて管理できます</p>
        </div>
        <Link href="/udemys/new" className="btn btn-primary text-center self-start sm:self-auto">
          ➕ 新規作成
        </Link>
      </div>

      {/* 検索・ソート・表示切替コントロール */}
      <ListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="コース名や学習メモで検索..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={udemys.length}
        filteredCount={filteredAndSortedUdemys.length}
      />

      {/* コンテンツ表示 */}
      {filteredAndSortedUdemys.length === 0 ? (
        <div className="card-basic text-center py-12 text-slate-400 space-y-3">
          <p className="text-lg font-medium">該当するUdemy記録が見つかりませんでした</p>
          <Link href="/udemys/new" className="btn btn-primary inline-block text-sm">
            最初の記録を作成
          </Link>
        </div>
      ) : (
        <UdemyCards udemys={filteredAndSortedUdemys} viewMode={viewMode} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default UdemyListPage;
