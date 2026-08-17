'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import BlogCards from '@/app/components/BlogCards';
import ListControls from '@/app/components/ListControls';
import type { Blog } from '@/types/blog';

const BlogListPage = () => {
  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const loadBlogs = async () => {
    try {
      const res = await fetch('/api/blog');
      if (!res.ok) throw new Error('読み込み失敗');
      const data: Blog[] = await res.json();
      setBlogs(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleImport = async () => {
    setImporting(true);
    const res = await fetch('/api/blog/import-blogger', { method: 'POST' });
    if (res.ok) {
      loadBlogs();
    } else {
      alert('取り込み失敗');
    }
    setImporting(false);
  };

  const filteredAndSortedBlogs = useMemo(() => {
    if (!blogs) return [];
    let list = [...blogs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.content.toLowerCase().includes(q) ||
          (b.author && b.author.toLowerCase().includes(q))
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
  }, [blogs, searchQuery, sortBy]);

  const handleDelete = (id: number) => {
    setBlogs((prev) => (prev ? prev.filter((b) => b.id !== id) : null));
  };

  if (error) return <div className="text-rose-400 text-center p-6 card-basic">読み込みエラー: {error}</div>;
  if (!blogs) return <div className="text-center text-slate-300 p-8">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            📰 ブログ記事一覧
          </h1>
          <p className="text-xs text-slate-300 mt-1">著者・ペルソナ・Blogger連携と記事管理</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/blogs/new" className="btn btn-primary">➕ 新規作成</Link>
          <Link href="/authors" className="btn btn-success">👤 著者一覧</Link>
          <Link href="/personas" className="btn btn-purple">🎭 ペルソナ一覧</Link>
          <button
            onClick={handleImport}
            disabled={importing}
            className="btn btn-secondary text-xs"
          >
            {importing ? '同期中...' : '🔄 Blogger同期'}
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/blog/export-blogger"
            className="btn btn-warning text-xs"
          >
            📤 エクスポート
          </a>
        </div>
      </div>

      {/* 検索・ソート・表示切替コントロール */}
      <ListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="タイトル、本文、著者で検索..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={blogs.length}
        filteredCount={filteredAndSortedBlogs.length}
      />

      {/* コンテンツ表示 */}
      {filteredAndSortedBlogs.length === 0 ? (
        <div className="card-basic text-center py-12 text-slate-400 space-y-3">
          <p className="text-lg font-medium">該当するブログ記事が見つかりませんでした</p>
          <Link href="/blogs/new" className="btn btn-primary inline-block text-sm">
            最初の記事を作成
          </Link>
        </div>
      ) : (
        <BlogCards blogs={filteredAndSortedBlogs} viewMode={viewMode} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default BlogListPage;
