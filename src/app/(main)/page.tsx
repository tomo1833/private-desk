'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import type { Diary } from '@/types/diary';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';

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
        const response = await fetch('/api/diary');
        if (!response.ok) throw new Error('日記の取得に失敗しました。');
        const data: Diary[] = await response.json();
        // 新しい順にソート（最新が最初に来るように）
        const sortedData = data.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setDiaries(sortedData);
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
      // 左スワイプ：次の日記へ
      handleNext();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      // 右スワイプ：前の日記へ
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
    return <div className="text-center p-4">読み込み中...</div>;
  }

  const currentDiary = diaries[currentIndex];

  return (
    <div className="space-y-6 page-wrap">
      {/* デスクトップ用：その他の機能（上部） */}
      <div className="hidden sm:block">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
          その他の機能
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <Link href="/wikis" className="btn btn-secondary text-sm sm:text-base">
            📝 Wiki
          </Link>
          <Link href="/blogs" className="btn btn-secondary text-sm sm:text-base">
            ✍️ ブログ
          </Link>
          <Link href="/animes" className="btn btn-secondary text-sm sm:text-base">
            🎬 アニメ記録
          </Link>
          <Link href="/books" className="btn btn-secondary text-sm sm:text-base">
            📚 本
          </Link>
          <Link href="/movies" className="btn btn-secondary text-sm sm:text-base">
            🎞 映画
          </Link>
          <Link href="/narous" className="btn btn-secondary text-sm sm:text-base">
            📖 なろう小説
          </Link>
          <Link href="/udemys" className="btn btn-secondary text-sm sm:text-base">
            🎓 Udemy
          </Link>
          <Link href="/passwords" className="btn btn-secondary text-sm sm:text-base">
            🔐 パスワード
          </Link>
          <Link href="/expenses" className="btn btn-secondary text-sm sm:text-base">
            💰 家計簿
          </Link>
          <Link href="/files" className="btn btn-secondary text-sm sm:text-base">
            📁 ファイル
          </Link>
          <Link href="/schedule" className="btn btn-secondary text-sm sm:text-base">
            📅 カレンダー
          </Link>
          <Link href="/sql" className="btn btn-secondary text-sm sm:text-base">
            🛢 SQL
          </Link>
          <Link href="/authors" className="btn btn-secondary text-sm sm:text-base">
            👤 著者
          </Link>
          <Link href="/personas" className="btn btn-secondary text-sm sm:text-base">
            🎭 ペルソナ
          </Link>
        </div>
      </div>

      {/* 日記セクション（下部） */}
      <div className="pt-6 border-t border-gray-300/30">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">最新の日記</h1>
          <div className="flex gap-2">
            <Link href="/diaries" className="btn btn-secondary text-sm sm:text-base">
              📋 一覧
            </Link>
            <Link href="/diaries/new" className="btn btn-primary text-sm sm:text-base">
              📔 新規作成
            </Link>
          </div>
        </div>

        {error ? (
          <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            {error}
          </div>
        ) : diaries.length > 0 && currentDiary ? (
          <div
            className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-4 sm:p-6 space-y-4 relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* ナビゲーションボタン */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                ← 前へ
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentIndex + 1} / {diaries.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex === diaries.length - 1}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                次へ →
              </button>
            </div>

            {/* 日記詳細 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {currentDiary.title}
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {currentDiary.created_at
                  ? new Date(currentDiary.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })
                  : ''}
              </div>
              <MarkdownRenderer className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-200">
                {currentDiary.content}
              </MarkdownRenderer>
            </div>

            {/* 編集リンク */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/diaries/${currentDiary.id}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                詳細を見る
              </Link>
              <Link
                href={`/diaries/edit/${currentDiary.id}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                編集
              </Link>
            </div>

            {/* スワイプヒント（モバイルのみ） */}
            <div className="sm:hidden text-center text-xs text-gray-400 pt-2">
              ← スワイプで前後の日記を表示 →
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <p className="text-lg mb-4">まだ日記がありません</p>
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
