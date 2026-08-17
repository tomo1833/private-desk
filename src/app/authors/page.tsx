'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import type { Author } from '@/types/author';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import ListControls from '@/app/components/ListControls';

const AuthorListPage = () => {
  const [authors, setAuthors] = useState<Author[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/author');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Author[] = await res.json();
        setAuthors(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/author/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAuthors(authors!.filter((a) => a.id !== id));
    } else {
      alert('削除失敗');
    }
  };

  const filteredAndSortedAuthors = useMemo(() => {
    if (!authors) return [];
    let list = [...authors];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) => a.name.toLowerCase().includes(q) || (a.bio && a.bio.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ja');
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'oldest') return a.id - b.id;
      return 0;
    });

    return list;
  }, [authors, searchQuery, sortBy]);

  if (error) return <div className="text-rose-400 text-center p-6 card-basic">読み込みエラー: {error}</div>;
  if (!authors) return <div className="text-center text-slate-300 p-8">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            👤 著者一覧
          </h1>
          <p className="text-xs text-slate-300 mt-1">ブログ執筆著者プロフィール管理</p>
        </div>
        <Link href="/authors/new" className="btn btn-primary text-center self-start sm:self-auto">
          ➕ 新規登録
        </Link>
      </div>

      {/* コントロール */}
      <ListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="著者名やプロフィールで検索..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={[
          { value: 'name', label: '名前順' },
          { value: 'newest', label: '新しい順' },
          { value: 'oldest', label: '古い順' },
        ]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={authors.length}
        filteredCount={filteredAndSortedAuthors.length}
      />

      {/* コンテンツ */}
      {filteredAndSortedAuthors.length === 0 ? (
        <div className="card-basic text-center py-12 text-slate-400">
          該当する著者が見つかりませんでした
        </div>
      ) : viewMode === 'table' ? (
        <div className="table-container">
          <table className="table-basic">
            <thead>
              <tr>
                <th className="table-header w-1/4">著者名</th>
                <th className="table-header">プロフィール / 経歴</th>
                <th className="table-header text-right w-40">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedAuthors.map((a) => (
                <tr key={a.id} className="table-row">
                  <td className="table-cell font-semibold text-slate-100">👤 {a.name}</td>
                  <td className="table-cell text-xs text-slate-300">
                    <p className="line-clamp-2">{a.bio || '-'}</p>
                  </td>
                  <td className="table-cell text-right space-x-2">
                    <Link href={`/authors/edit/${a.id}`} className="btn btn-sm btn-success">
                      編集
                    </Link>
                    <button onClick={() => handleDelete(a.id)} className="btn btn-sm btn-danger">
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredAndSortedAuthors.map((a) => (
            <div key={a.id} className="card-basic flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <p className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <span>👤</span> {a.name}
                </p>
                {a.bio && (
                  <MarkdownRenderer className="text-xs sm:text-sm text-slate-300 line-clamp-4 leading-relaxed">
                    {a.bio}
                  </MarkdownRenderer>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700/80">
                <Link href={`/authors/edit/${a.id}`} className="btn btn-sm btn-success">
                  編集
                </Link>
                <button onClick={() => handleDelete(a.id)} className="btn btn-sm btn-danger">
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthorListPage;
