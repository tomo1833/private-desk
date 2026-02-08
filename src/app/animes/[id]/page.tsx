'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Anime } from '@/types/anime';

const AnimeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allAnimes, setAllAnimes] = useState<Anime[]>([]);
  
  // スワイプ機能用
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAnimes = async () => {
      try {
        const res = await fetch('/api/anime');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Anime[] = await res.json();
        setAllAnimes(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadAnimes();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/anime/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Anime = await res.json();
        setAnime(data);
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
    if (!anime || allAnimes.length === 0) return;

    const swipeThreshold = 50; // スワイプの閾値（ピクセル）
    const swipeDistance = touchStartX.current - touchEndX.current;

    const currentIndex = allAnimes.findIndex(d => d.id === anime.id);
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // 左にスワイプ → 次の記録へ
        if (currentIndex < allAnimes.length - 1) {
          router.push(`/animes/${allAnimes[currentIndex + 1].id}`);
        }
      } else {
        // 右にスワイプ → 前の記録へ
        if (currentIndex > 0) {
          router.push(`/animes/${allAnimes[currentIndex - 1].id}`);
        }
      }
    }

    // リセット
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (error) return <div className="text-red-500 text-center p-4">読み込みエラー</div>;
  if (!anime) return <div className="text-center p-4">読み込み中...</div>;

  const currentIndex = allAnimes.findIndex(d => d.id === anime.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allAnimes.length - 1;

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
              onClick={() => router.push(`/animes/${allAnimes[currentIndex - 1].id}`)}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              ← 前の記録
            </button>
          )}
        </div>
        <div className="text-center">
          {allAnimes.length > 0 && (
            <span>{currentIndex + 1} / {allAnimes.length}</span>
          )}
        </div>
        <div>
          {hasNext && (
            <button 
              onClick={() => router.push(`/animes/${allAnimes[currentIndex + 1].id}`)}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              次の記録 →
            </button>
          )}
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-white">{anime.title}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg">
        <MarkdownRenderer className="whitespace-pre-wrap">
          {anime.content}
        </MarkdownRenderer>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
        <button 
          onClick={() => router.push('/animes')} 
          className="btn btn-secondary order-2 sm:order-1"
        >
          一覧に戻る
        </button>
        <button 
          onClick={() => router.push(`/animes/edit/${anime.id}`)} 
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

export default AnimeDetailPage;
