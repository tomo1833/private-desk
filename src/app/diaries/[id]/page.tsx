'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Diary } from '@/types/diary';

const DiaryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [diary, setDiary] = useState<Diary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allDiaries, setAllDiaries] = useState<Diary[]>([]);
  
  // スワイプ機能用
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDiaries = async () => {
      try {
        const res = await fetch('/api/diary');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Diary[] = await res.json();
        setAllDiaries(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadDiaries();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/diary/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Diary = await res.json();
        setDiary(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, [id]);

  // スワイプ処理
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!diary || allDiaries.length === 0) return;

    const swipeThreshold = 50; // スワイプの閾値（ピクセル）
    const swipeDistance = touchStartX.current - touchEndX.current;

    const currentIndex = allDiaries.findIndex(d => d.id === diary.id);
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // 左にスワイプ → 次の日記へ
        if (currentIndex < allDiaries.length - 1) {
          router.push(`/diaries/${allDiaries[currentIndex + 1].id}`);
        }
      } else {
        // 右にスワイプ → 前の日記へ
        if (currentIndex > 0) {
          router.push(`/diaries/${allDiaries[currentIndex - 1].id}`);
        }
      }
    }

    // リセット
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (error) return <div className="text-red-500 text-center p-4">読み込みエラー</div>;
  if (!diary) return <div className="text-center p-4">読み込み中...</div>;

  const currentIndex = allDiaries.findIndex(d => d.id === diary.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allDiaries.length - 1;

  return (
    <div 
      ref={containerRef}
      className="space-y-4 w-full px-2 sm:px-6 lg:px-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ナビゲーション表示 */}
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div>
          {hasPrev && (
            <button 
              onClick={() => router.push(`/diaries/${allDiaries[currentIndex - 1].id}`)}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              ← 前の日記
            </button>
          )}
        </div>
        <div className="text-center">
          {allDiaries.length > 0 && (
            <span>{currentIndex + 1} / {allDiaries.length}</span>
          )}
        </div>
        <div>
          {hasNext && (
            <button 
              onClick={() => router.push(`/diaries/${allDiaries[currentIndex + 1].id}`)}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              次の日記 →
            </button>
          )}
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-white">{diary.title}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg">
        <MarkdownRenderer className="whitespace-pre-wrap">
          {diary.content}
        </MarkdownRenderer>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
        <button 
          onClick={() => router.push('/diaries')} 
          className="btn btn-secondary order-2 sm:order-1"
        >
          一覧に戻る
        </button>
        <button 
          onClick={() => router.push(`/diaries/edit/${diary.id}`)} 
          className="btn btn-primary order-1 sm:order-2"
        >
          編集
        </button>
      </div>

      {/* スワイプヒント（モバイルのみ表示） */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 sm:hidden">
        ← スワイプして前後の日記に移動 →
      </div>
    </div>
  );
};

export default DiaryDetailPage;
