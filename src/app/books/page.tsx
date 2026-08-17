'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import BookCards from '@/app/components/BookCards';
import ListControls from '@/app/components/ListControls';
import type { Book } from '@/types/book';

const BookListPage = () => {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const loadBooks = async () => {
    try {
      const res = await fetch('/api/book');
      if (!res.ok) throw new Error('読み込み失敗');
      const data: Book[] = await res.json();
      setBooks(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const filteredAndSortedBooks = useMemo(() => {
    if (!books) return [];
    let list = [...books];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) => b.title.toLowerCase().includes(q) || b.content.toLowerCase().includes(q)
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
  }, [books, searchQuery, sortBy]);

  const handleDelete = (id: number) => {
    setBooks((prev) => (prev ? prev.filter((b) => b.id !== id) : null));
  };

  if (error) return <div className="text-rose-400 text-center p-6 card-basic">読み込みエラー: {error}</div>;
  if (!books) return <div className="text-center text-slate-300 p-8">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            📚 本の記録一覧
          </h1>
          <p className="text-xs text-slate-300 mt-1">読書メモ・書籍の感想ログをまとめて管理できます</p>
        </div>
        <Link href="/books/new" className="btn btn-primary text-center self-start sm:self-auto">
          ➕ 新規作成
        </Link>
      </div>

      {/* 検索・ソート・表示切替コントロール */}
      <ListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="書籍名やメモ・感想で検索..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={books.length}
        filteredCount={filteredAndSortedBooks.length}
      />

      {/* コンテンツ表示 */}
      {filteredAndSortedBooks.length === 0 ? (
        <div className="card-basic text-center py-12 text-slate-400 space-y-3">
          <p className="text-lg font-medium">該当する本が見つかりませんでした</p>
          <Link href="/books/new" className="btn btn-primary inline-block text-sm">
            最初の記録を作成
          </Link>
        </div>
      ) : (
        <BookCards books={filteredAndSortedBooks} viewMode={viewMode} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default BookListPage;
