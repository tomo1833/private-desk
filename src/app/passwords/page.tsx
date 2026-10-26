'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import PasswordCards from '@/app/components/PasswordCards';
import ListControls from '@/app/components/ListControls';
import type { Password } from '@/types/password';

const PasswordListPage = () => {
  const [passwords, setPasswords] = useState<Password[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const loadPasswords = async () => {
    try {
      const res = await fetch('/api/passwords');
      if (!res.ok) throw new Error('読み込み失敗');
      const data: Password[] = await res.json();
      setPasswords(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadPasswords();
  }, []);

  const filteredAndSortedPasswords = useMemo(() => {
    if (!passwords) return [];
    let list = [...passwords];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.site_name.toLowerCase().includes(q) ||
          (p.login_id && p.login_id.toLowerCase().includes(q)) ||
          (p.site_url && p.site_url.toLowerCase().includes(q)) ||
          (p.memo && p.memo.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'title') {
        return a.site_name.localeCompare(b.site_name, 'ja');
      }
      if (sortBy === 'newest') {
        return b.id - a.id;
      }
      if (sortBy === 'oldest') {
        return a.id - b.id;
      }
      return 0;
    });

    return list;
  }, [passwords, searchQuery, sortBy]);

  if (error) return <div className="text-rose-400 text-center p-6 card-basic">読み込みエラー: {error}</div>;
  if (!passwords) return <div className="text-center text-slate-300 p-8">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            🔐 パスワード管理
          </h1>
          <p className="text-xs text-slate-300 mt-1">各種Webサービス・アカウント情報とワンタップコピー</p>
        </div>
        <Link href="/passwords/new" className="btn btn-primary text-center self-start sm:self-auto">
          ➕ 新規作成
        </Link>
      </div>

      {/* 検索・ソート・表示切替コントロール */}
      <ListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="サイト名、ID、URL、メモで検索..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={[
          { value: 'title', label: 'サイト名順' },
          { value: 'newest', label: '登録が新しい順' },
          { value: 'oldest', label: '登録が古い順' },
        ]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={passwords.length}
        filteredCount={filteredAndSortedPasswords.length}
      />

      {/* コンテンツ表示 */}
      {filteredAndSortedPasswords.length === 0 ? (
        <div className="card-basic text-center py-12 text-slate-400 space-y-3">
          <p className="text-lg font-medium">該当するパスワード情報が見つかりませんでした</p>
          <Link href="/passwords/new" className="btn btn-primary inline-block text-sm">
            最初のパスワードを登録
          </Link>
        </div>
      ) : (
        <PasswordCards passwords={filteredAndSortedPasswords} viewMode={viewMode} />
      )}
    </div>
  );
};

export default PasswordListPage;
