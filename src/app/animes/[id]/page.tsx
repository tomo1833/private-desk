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
    const swipeThreshold = 50;
    const swipeDistance = touchStartX.current - touchEndX.current;
    const currentIndex = allAnimes.findIndex(d => d.id === anime.id);
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        if (currentIndex < allAnimes.length - 1) {
          router.push(`/animes/${allAnimes[currentIndex + 1].id}`);
        }
      } else {
        if (currentIndex > 0) {
          router.push(`/animes/${allAnimes[currentIndex - 1].id}`);
        }
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (error) return <div className="page-wrap p-8 text-center text-rose-400 card-basic">読み込みエラー</div>;
  if (!anime) return <div className="page-wrap p-8 text-center text-slate-300 card-basic">読み込み中...</div>;

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
      <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
        <div>
          {hasPrev && (
            <button 
              onClick={() => router.push(`/animes/${allAnimes[currentIndex - 1].id}`)}
              className="hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              ← 前の記録
            </button>
          )}
        </div>
        <div className="text-center font-mono">
          {allAnimes.length > 0 && (
            <span>{currentIndex + 1} / {allAnimes.length}</span>
          )}
        </div>
        <div>
          {hasNext && (
            <button 
              onClick={() => router.push(`/animes/${allAnimes[currentIndex + 1].id}`)}
              className="hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              次の記録 →
            </button>
          )}
        </div>
      </div>

      <div className="card-basic space-y-4 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white border-b border-slate-700/80 pb-3 flex items-center gap-2">
          <span>🎬</span> {anime.title}
        </h1>
        
        <div className="prose prose-invert max-w-none text-slate-100 leading-relaxed pt-2">
          <MarkdownRenderer className="whitespace-pre-wrap">
            {anime.content}
          </MarkdownRenderer>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-slate-700/80">
          <button 
            onClick={() => router.push('/animes')} 
            className="btn btn-secondary text-xs px-4 py-2 order-2 sm:order-1"
          >
            一覧に戻る
          </button>
          <button 
            onClick={() => router.push(`/animes/edit/${anime.id}`)} 
            className="btn btn-primary text-xs px-4 py-2 order-1 sm:order-2"
          >
            編集
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 mt-2 sm:hidden">
        ← スワイプして前後の記録に移動 →
      </div>
    </div>
  );
};

export default AnimeDetailPage;
