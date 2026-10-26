'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import type { Diary } from '@/types/diary';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';

interface FeatureCard {
  href: string;
  icon: string;
  name: string;
  desc: string;
  badge?: string;
  gradient: string;
  borderGlow: string;
}

const KNOWLEDGE_FEATURES: FeatureCard[] = [
  { href: '/wikis', icon: '📝', name: 'Wiki', desc: 'ナレッジ・日報メモ', gradient: 'from-blue-500/20 to-indigo-500/20', borderGlow: 'hover:border-blue-500/40' },
  { href: '/blogs', icon: '✍️', name: 'ブログ', desc: '記事作成・LLM生成', badge: 'AI', gradient: 'from-violet-500/20 to-purple-500/20', borderGlow: 'hover:border-violet-500/40' },
  { href: '/narous', icon: '📖', name: 'なろう小説', desc: '小説閲覧・感想記録', gradient: 'from-purple-500/20 to-pink-500/20', borderGlow: 'hover:border-purple-500/40' },
  { href: '/authors', icon: '👤', name: '著者', desc: '執筆者プロフィール', gradient: 'from-sky-500/20 to-blue-500/20', borderGlow: 'hover:border-sky-500/40' },
  { href: '/personas', icon: '🎭', name: 'ペルソナ', desc: 'キャラクター設定管理', gradient: 'from-fuchsia-500/20 to-pink-500/20', borderGlow: 'hover:border-fuchsia-500/40' },
];

const MEDIA_FEATURES: FeatureCard[] = [
  { href: '/animes', icon: '🎬', name: 'アニメ記録', desc: '視聴状況・評価', gradient: 'from-rose-500/20 to-red-500/20', borderGlow: 'hover:border-rose-500/40' },
  { href: '/books', icon: '📚', name: '本', desc: '読書ログ・要約', gradient: 'from-amber-500/20 to-yellow-500/20', borderGlow: 'hover:border-amber-500/40' },
  { href: '/movies', icon: '🎞', name: '映画', desc: '映画レビュー・記録', gradient: 'from-orange-500/20 to-amber-500/20', borderGlow: 'hover:border-orange-500/40' },
  { href: '/musics', icon: '🎵', name: '音楽', desc: 'アルバム・トラックメモ', gradient: 'from-emerald-500/20 to-teal-500/20', borderGlow: 'hover:border-emerald-500/40' },
  { href: '/udemys', icon: '🎓', name: 'Udemy', desc: 'オンライン講座進捗', gradient: 'from-cyan-500/20 to-teal-500/20', borderGlow: 'hover:border-cyan-500/40' },
];

const MANAGEMENT_FEATURES: FeatureCard[] = [
  { href: '/passwords', icon: '🔐', name: 'パスワード', desc: '資格情報・ログイン管理', gradient: 'from-emerald-500/20 to-teal-500/20', borderGlow: 'hover:border-emerald-500/40' },
  { href: '/expenses', icon: '💰', name: '家計簿', desc: '支出管理・統計グラフ', gradient: 'from-teal-500/20 to-cyan-500/20', borderGlow: 'hover:border-teal-500/40' },
  { href: '/wishlists', icon: '🎁', name: 'ほしいもの', desc: '買いたい物・優先度・見積', gradient: 'from-pink-500/20 to-rose-500/20', borderGlow: 'hover:border-pink-500/40' },
  { href: '/stocks', icon: '📈', name: '日本株', desc: '株価ポートフォリオ', gradient: 'from-sky-500/20 to-indigo-500/20', borderGlow: 'hover:border-sky-500/40' },
  { href: '/subscriptions', icon: '💻', name: 'サブスク・ソフト', desc: '月額サービス・ライセンス', gradient: 'from-indigo-500/20 to-blue-500/20', borderGlow: 'hover:border-indigo-500/40' },
  { href: '/files', icon: '📁', name: 'ファイル', desc: 'ドキュメント・添付管理', gradient: 'from-blue-500/20 to-cyan-500/20', borderGlow: 'hover:border-blue-500/40' },
  { href: '/schedule', icon: '📅', name: 'カレンダー', desc: 'Google同期・予定表', gradient: 'from-violet-500/20 to-purple-500/20', borderGlow: 'hover:border-violet-500/40' },
  { href: '/wbs', icon: '📊', name: 'WBS', desc: 'プロジェクト・ガントチャート', badge: 'PRO', gradient: 'from-indigo-600/30 to-violet-600/30', borderGlow: 'hover:border-indigo-500/60' },
  { href: '/sql', icon: '🛢', name: 'SQL', desc: 'データベース直操作', gradient: 'from-slate-500/20 to-gray-500/20', borderGlow: 'hover:border-slate-500/40' },
];

const MainPage = () => {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // スワイプ処理用のref
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    const loadDiaries = async () => {
      try {
        const response = await fetch('/api/diary?limit=20');
        if (!response.ok) throw new Error('日記の取得に失敗しました。');
        const data: Diary[] = await response.json();
        setDiaries(data);
      } catch (err) {
        console.error('Error fetching diaries:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadDiaries();
  }, []);

  // スワイプ処理
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNext();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      handlePrevious();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < diaries.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm animate-pulse">読み込み中...</p>
      </div>
    );
  }

  const currentDiary = diaries[currentIndex];

  const renderCard = (item: FeatureCard) => (
    <Link
      key={item.href}
      href={item.href}
      className={`group relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 ${item.borderGlow} hover:bg-slate-800/70 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
    >
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${item.gradient} border border-white/10 flex items-center justify-center text-xl sm:text-2xl shadow-inner group-hover:scale-110 transition-transform`}>
        {item.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-100 text-sm sm:text-base group-hover:text-indigo-300 transition-colors truncate">
            {item.icon} {item.name}
          </span>
          {item.badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/30 border border-indigo-500/50 text-indigo-300">
              {item.badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate mt-0.5 font-normal">
          {item.desc}
        </p>
      </div>
      <span className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all text-sm">
        →
      </span>
    </Link>
  );

  return (
    <div className="space-y-10 page-wrap">
      {/* ヒーローセクション */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900/80 to-purple-950/80 backdrop-blur-xl border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ローカル環境で安全に稼働中
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 tracking-tight">
              Private Desk Workspace
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1 max-w-2xl">
              日々の記録・ナレッジ・エンタメ・タスクをひとつの洗練された環境で一元管理。
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/diaries/new" className="btn btn-primary text-xs sm:text-sm">
              📔 新規日記
            </Link>
            <Link href="/wikis/new" className="btn btn-secondary text-xs sm:text-sm">
              📝 新規Wiki
            </Link>
            <Link href="/schedule" className="btn btn-secondary text-xs sm:text-sm">
              📅 カレンダー
            </Link>
          </div>
        </div>
      </div>

      {/* その他の機能（カテゴリ別グリッド） */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            その他の機能
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">全19機能</span>
        </div>

        {/* カテゴリ1: 記録 & ナレッジ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <span>📝</span> 記録 & ナレッジ (Knowledge & Notes)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {KNOWLEDGE_FEATURES.map(renderCard)}
          </div>
        </div>

        {/* カテゴリ2: エンタメ & 学習 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <span>🎬</span> エンタメ & 学習 (Media & Learning)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {MEDIA_FEATURES.map(renderCard)}
          </div>
        </div>

        {/* カテゴリ3: ツール & 管理 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <span>💼</span> ツール & 管理 (Management & Tools)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8 gap-3">
            {MANAGEMENT_FEATURES.map(renderCard)}
          </div>
        </div>
      </div>

      {/* 日記セクション */}
      <div className="pt-6 border-t border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <span className="text-2xl">📔</span> 最新の日記
              <span className="sr-only">日記一覧</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              スワイプまたは前後のボタンで過去の日記を閲覧できます
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/diaries" className="btn btn-secondary text-xs sm:text-sm">
              📋 一覧
            </Link>
            <Link href="/diaries/new" className="btn btn-primary text-xs sm:text-sm">
              📔 新規作成
            </Link>
          </div>
        </div>

        {error ? (
          <div className="text-center text-rose-400 bg-rose-950/40 border border-rose-800/50 p-4 rounded-2xl">
            {error}
          </div>
        ) : diaries.length > 0 && currentDiary ? (
          <div
            className="card-basic space-y-5 relative overflow-hidden border border-slate-700/60 bg-slate-900/70"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* ナビゲーションバー */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="btn btn-secondary text-xs sm:text-sm px-3.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← 前へ
              </button>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-xs font-mono font-medium text-indigo-300 border border-slate-700">
                  {currentIndex + 1} / {diaries.length}
                </span>
              </div>
              <button
                onClick={handleNext}
                disabled={currentIndex === diaries.length - 1}
                className="btn btn-secondary text-xs sm:text-sm px-3.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                次へ →
              </button>
            </div>

            {/* 日記コンテンツ */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg sm:text-2xl font-bold text-slate-100">
                  {currentDiary.title}
                </h3>
                <span className="text-xs text-slate-400 font-mono px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  {currentDiary.created_at
                    ? new Date(currentDiary.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })
                    : ''}
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <MarkdownRenderer className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base">
                  {currentDiary.content}
                </MarkdownRenderer>
              </div>
            </div>

            {/* 編集・詳細リンク */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80">
              <Link
                href={`/diaries/${currentDiary.id}`}
                className="text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 font-medium hover:underline flex items-center gap-1"
              >
                詳細を見る →
              </Link>
              <Link
                href={`/diaries/edit/${currentDiary.id}`}
                className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 font-medium hover:underline flex items-center gap-1"
              >
                編集する ✍️
              </Link>
            </div>

            {/* スワイプヒント（モバイルのみ） */}
            <div className="sm:hidden text-center text-[11px] text-slate-500 pt-1">
              ← スワイプで前後の日記を表示 →
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 text-gray-500 py-12 card-basic border border-dashed border-slate-800">
            <p className="text-lg font-medium mb-3 text-slate-300 text-gray-500 dark:text-gray-400">まだ日記がありません</p>
            <Link href="/diaries/new" className="btn btn-primary inline-block">
              最初の日記を作成
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
