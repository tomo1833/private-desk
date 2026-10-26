'use client';

import React, { useId } from 'react';

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
  const searchId = useId();
  const displayFiltered = filteredCount !== undefined && filteredCount !== totalCount;

  return (
    <div className="card-basic space-y-4 p-4 sm:p-5">
      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="search" aria-label="一覧内検索" className="relative min-w-0 flex-1">
          <label htmlFor={searchId} className="sr-only">
            一覧を検索
          </label>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
            <path d="m16 16 4 4" strokeLinecap="round" strokeWidth="1.8" />
          </svg>
          <input
            id={searchId}
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="form-input min-h-11 w-full pl-10! pr-24 text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="検索条件をクリア"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 inline-flex min-h-11 -translate-y-1/2 items-center rounded-lg px-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              クリア
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {extraControls}

          {sortBy && onSortChange && sortOptions.length > 0 && (
            <select
              aria-label="並び順"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="min-h-11 min-w-32 cursor-pointer rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          <div
            role="group"
            aria-label="表示方法"
            className="flex rounded-xl border border-slate-700 bg-slate-950/70 p-1"
          >
            <button
              type="button"
              aria-label="カード表示"
              aria-pressed={viewMode === 'card'}
              onClick={() => onViewModeChange('card')}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                viewMode === 'card'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span aria-hidden="true">▦</span>
              <span className="hidden sm:inline">カード</span>
            </button>
            <button
              type="button"
              aria-label="テーブル表示"
              aria-pressed={viewMode === 'table'}
              onClick={() => onViewModeChange('table')}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                viewMode === 'table'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span aria-hidden="true">▤</span>
              <span className="hidden sm:inline">テーブル</span>
            </button>
          </div>

          <p
            role="status"
            aria-live="polite"
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-xs font-medium text-slate-300"
          >
            {displayFiltered
              ? `${filteredCount} / ${totalCount} 件`
              : `全 ${totalCount} 件`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListControls;
