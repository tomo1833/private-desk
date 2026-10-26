'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Diary } from '@/types/diary';
import { APP_FEATURE_GROUPS, QUICK_ACTIONS } from '@/app/features';

const formatDiaryDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'long',
    timeZone: 'Asia/Tokyo',
  }).format(date);
};

const MainPage = () => {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [diariesLoading, setDiariesLoading] = useState(true);
  const [diaryError, setDiaryError] = useState<string | null>(null);
  const [featureQuery, setFeatureQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDiaries = async () => {
      try {
        const response = await fetch('/api/diary?limit=3');
        if (!response.ok) {
          throw new Error('最新の日記を読み込めませんでした。');
        }

        const data: Diary[] = await response.json();
        if (isMounted) setDiaries(data);
      } catch (error) {
        console.error('Error fetching diaries:', error);
        if (isMounted) {
          setDiaryError(
            error instanceof Error
              ? error.message
              : '最新の日記を読み込めませんでした。'
          );
        }
      } finally {
        if (isMounted) setDiariesLoading(false);
      }
    };

    void loadDiaries();
    return () => {
      isMounted = false;
    };
  }, []);

  const searchTerm = featureQuery.trim().toLocaleLowerCase('ja');
  const filteredGroups = APP_FEATURE_GROUPS.map((group) => ({
    ...group,
    features: group.features.filter((feature) => {
      const searchableText = [
        feature.name,
        feature.description,
        feature.keywords ?? '',
        group.title,
      ]
        .join(' ')
        .toLocaleLowerCase('ja');

      return searchableText.includes(searchTerm);
    }),
  })).filter((group) => group.features.length > 0);
  const featureCount = APP_FEATURE_GROUPS.reduce(
    (count, group) => count + group.features.length,
    0
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <section
          aria-labelledby="workspace-title"
          className="rounded-3xl border border-slate-700/70 bg-slate-950/75 p-5 shadow-xl shadow-black/10 sm:p-7"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
            Personal workspace
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h1
                id="workspace-title"
                className="text-xl font-bold tracking-tight text-white sm:text-3xl"
              >
                今日のデスク
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                記録、予定、アイデア。いつもの作業をここから始めましょう。
              </p>
            </div>
            <span className="hidden shrink-0 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 sm:inline-flex">
              {featureCount} 個の機能
            </span>
          </div>

          <div
            role="group"
            aria-label="クイックアクション"
            className="mt-6 grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:gap-3"
          >
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`group flex min-h-24 items-center gap-2.5 rounded-2xl border p-3 transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 sm:min-h-28 sm:gap-3 sm:p-4 ${
                  action.primary
                    ? 'border-indigo-400/40 bg-indigo-500/15 hover:border-indigo-300/70 hover:bg-indigo-500/20'
                    : 'border-slate-700/80 bg-slate-900/70 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg sm:h-10 sm:w-10 ${
                    action.primary
                      ? 'bg-indigo-400/15 text-indigo-200'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {action.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-100">
                    {action.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                    {action.description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="hidden text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-indigo-300 sm:inline"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="recent-diaries-title"
          className="rounded-3xl border border-slate-700/70 bg-slate-900/65 p-5 shadow-lg shadow-black/10 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2
                id="recent-diaries-title"
                className="text-lg font-semibold text-slate-100"
              >
                最近の日記
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                直近の記録をすぐに確認できます
              </p>
            </div>
            <Link
              href="/diaries"
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-indigo-300 transition hover:bg-slate-800 hover:text-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              一覧を見る
            </Link>
          </div>

          <div className="mt-4" aria-live="polite">
            {diariesLoading ? (
              <p
                role="status"
                className="rounded-xl border border-slate-700/70 bg-slate-950/50 px-4 py-6 text-center text-sm text-slate-400"
              >
                最新の日記を読み込み中...
              </p>
            ) : diaryError ? (
              <p
                role="alert"
                className="rounded-xl border border-rose-800/60 bg-rose-950/30 px-4 py-4 text-sm text-rose-200"
              >
                {diaryError}
              </p>
            ) : diaries.length > 0 ? (
              <ul className="divide-y divide-slate-700/70">
                {diaries.map((diary) => {
                  const dateLabel = formatDiaryDate(diary.created_at);
                  const preview = diary.content.trim();

                  return (
                    <li key={diary.id}>
                      <Link
                        href={`/diaries/${diary.id}`}
                        className="group block rounded-xl px-3 py-3 transition hover:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="min-w-0 truncate text-sm font-semibold text-slate-100 group-hover:text-indigo-200">
                            {diary.title}
                          </span>
                          {dateLabel && (
                            <time
                              dateTime={diary.created_at}
                              className="shrink-0 text-xs text-slate-400"
                            >
                              {dateLabel}
                            </time>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                          {preview || '本文はありません。'}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-6 text-center">
                <p className="text-sm font-medium text-slate-200">
                  まだ日記がありません
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  今日の出来事を最初の記録に残しましょう。
                </p>
                <Link
                  href="/diaries/new"
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  日記を書く
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      <section aria-labelledby="feature-directory-title">
        <div className="flex flex-col gap-4 border-b border-slate-700/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
              Your tools
            </p>
            <h2
              id="feature-directory-title"
              className="mt-1 text-xl font-bold text-slate-100 sm:text-2xl"
            >
              機能を探す
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              目的別に整理した機能一覧です。
            </p>
          </div>

          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">機能名や内容で絞り込む</span>
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
              type="search"
              value={featureQuery}
              onChange={(event) => setFeatureQuery(event.target.value)}
              placeholder="機能を検索..."
              className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900/80 py-2 pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25"
            />
          </label>
        </div>

        <p aria-live="polite" className="mt-4 text-xs text-slate-400">
          {searchTerm
            ? `${filteredGroups.reduce((count, group) => count + group.features.length, 0)} 件の機能`
            : `全 ${featureCount} 件`}
        </p>

        {filteredGroups.length > 0 ? (
          <div className="mt-4 space-y-7">
            {filteredGroups.map((group) => (
              <section
                key={group.id}
                aria-labelledby={`feature-group-${group.id}`}
                className="space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-base"
                  >
                    {group.icon}
                  </span>
                  <div>
                    <h3
                      id={`feature-group-${group.id}`}
                      className="text-sm font-semibold text-slate-200"
                    >
                      {group.title}
                    </h3>
                    <p className="text-xs text-slate-400">{group.description}</p>
                  </div>
                </div>

                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {group.features.map((feature) => (
                    <li key={feature.href}>
                      <Link
                        href={feature.href}
                        className="group flex min-h-16 items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-900/55 px-3.5 py-3 transition duration-200 hover:border-indigo-400/50 hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                      >
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-lg"
                        >
                          {feature.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-100">
                            {feature.name}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-slate-400">
                            {feature.description}
                          </span>
                        </span>
                        {feature.badge && (
                          <span className="rounded-md border border-indigo-400/30 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-200">
                            {feature.badge}
                          </span>
                        )}
                        <span
                          aria-hidden="true"
                          className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-indigo-300"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-5 py-10 text-center">
            <p className="font-medium text-slate-200">
              該当する機能が見つかりません
            </p>
            <p className="mt-1 text-sm text-slate-400">
              別のキーワードで検索してください。
            </p>
            <button
              type="button"
              onClick={() => setFeatureQuery('')}
              className="mt-4 rounded-lg px-3 py-2 text-sm font-medium text-indigo-300 transition hover:bg-slate-800 hover:text-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              検索をクリア
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default MainPage;
