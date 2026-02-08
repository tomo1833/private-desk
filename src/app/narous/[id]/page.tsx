'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Narou } from '@/types/narou';

const NarouDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [narou, setNarou] = useState<Narou | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allNarous, setAllNarous] = useState<Narou[]>([]);
  
  // スワイプ機能用
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadNarous = async () => {
      try {
        const res = await fetch('/api/narou');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Narou[] = await res.json();
        setAllNarous(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadNarous();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/narou/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Narou = await res.json();
        setNarou(data);
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
    if (!narou || allNarous.length === 0) return;

    const swipeThreshold = 50; // スワイプの閾値（ピクセル）
    const swipeDistance = touchStartX.current - touchEndX.current;

    const currentIndex = allNarous.findIndex(d => d.id === narou.id);
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // 左にスワイプ → 次の記録へ
        if (currentIndex < allNarous.length - 1) {
          router.push(`/narous/${allNarous[currentIndex + 1].id}`);
        }
      } else {
        // 右にスワイプ → 前の記録へ
        if (currentIndex > 0) {
          router.push(`/narous/${allNarous[currentIndex - 1].id}`);
        }
      }
    }

    // リセット
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (error) return <div className="text-red-500 text-center p-4">読み込みエラー</div>;
  if (!narou) return <div className="text-center p-4">読み込み中...</div>;

  const currentIndex = allNarous.findIndex(d => d.id === narou.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allNarous.length - 1;

  return (
    <div 
      ref={containerRef}
      className="space-y-4 page-wrap"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ナビゲーション表示 */}
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div>
          {hasPrev && (
            <button 
              onClick={() => router.push(`/narous/${allNarous[currentIndex - 1].id}`)}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              ← 前の記録
            </button>
          )}
        </div>
        <div className="text-center">
          {allNarous.length > 0 && (
            <span>{currentIndex + 1} / {allNarous.length}</span>
          )}
        </div>
        <div>
          {hasNext && (
            <button 
              onClick={() => router.push(`/narous/${allNarous[currentIndex + 1].id}`)}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              次の記録 →
            </button>
          )}
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-white">{narou.title}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg">
        <MarkdownRenderer className="whitespace-pre-wrap">
          {narou.content}
        </MarkdownRenderer>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
        <button 
          onClick={() => router.push('/narous')} 
          className="btn btn-secondary order-2 sm:order-1"
        >
          一覧に戻る
        </button>
        <button 
          onClick={() => router.push(`/narous/edit/${narou.id}`)} 
          className="btn btn-primary order-1 sm:order-2"
        >
          編集
        </button>
      </div>

      {/* スワイプヒント（モバイルのみ表示） */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 sm:hidden">
        ← スワイプして前後の記録に移動 →
      </div>
    </div>
  );
};

export default NarouDetailPage;
