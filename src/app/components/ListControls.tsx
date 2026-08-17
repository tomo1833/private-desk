'use client';

import React from 'react';

export type SortOption = {
  value: string;
  label: string;
};

type Props = {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  sortOptions?: SortOption[];
  viewMode: 'card' | 'table';
  onViewModeChange: (mode: 'card' | 'table') => void;
  totalCount: number;
  filteredCount?: number;
  extraControls?: React.ReactNode;
};

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: '新しい順' },
  { value: 'oldest', label: '古い順' },
  { value: 'title', label: 'タイトル順' },
];

const ListControls: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'キーワードで検索...',
  sortBy,
  onSortChange,
  sortOptions = DEFAULT_SORT_OPTIONS,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
  extraControls,
}) => {
  const displayFiltered = filteredCount !== undefined && filteredCount !== totalCount;

  return (
    <div className="card-basic p-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* キーワード検索入力 */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            🔍
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-20 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-400 text-sm shadow-inner transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-200 text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 transition-colors"
            >
              ✕ クリア
            </button>
          )}
        </div>

        {/* コントロール群 (ソート・各種フィルター・表示切替・件数) */}
        <div className="flex flex-wrap items-center gap-2">
          {extraControls}

          {/* ソートドロップダウン */}
          {sortBy && onSortChange && sortOptions.length > 0 && (
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-2 bg-slate-900/90 border border-slate-700/80 text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/80 cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* ビューモードトグル */}
          <div className="flex rounded-xl bg-slate-900/90 border border-slate-700/80 p-1">
            <button
              onClick={() => onViewModeChange('card')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1 ${
                viewMode === 'card'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="カード表示"
            >
              <span>🎴</span>
              <span className="hidden sm:inline">カード</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="テーブル表示"
            >
              <span>📋</span>
              <span className="hidden sm:inline">テーブル</span>
            </button>
          </div>

          {/* 件数バッジ */}
          <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium flex items-center gap-1">
            <span>全</span>
            <span className="font-bold text-white">{displayFiltered ? filteredCount : totalCount}</span>
            {displayFiltered && <span className="text-slate-400">/ {totalCount}</span>}
            <span>件</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListControls;
