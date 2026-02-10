'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Music } from '@/types/music';

const MusicDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [music, setMusic] = useState<Music | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allMusics, setAllMusics] = useState<Music[]>([]);

  // スワイプ機能用
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMusics = async () => {
      try {
        const res = await fetch('/api/music');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Music[] = await res.json();
        setAllMusics(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadMusics();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/music/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Music = await res.json();
        setMusic(data);
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
    if (!music || allMusics.length === 0) return;

    const swipeThreshold = 50; // スワイプの閾値（ピクセル）
    const swipeDistance = touchStartX.current - touchEndX.current;

    const currentIndex = allMusics.findIndex(d => d.id === music.id);

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // 左にスワイプ → 次の記録へ
        if (currentIndex < allMusics.length - 1) {
          router.push(`/musics/${allMusics[currentIndex + 1].id}`);
        }
      } else {
        // 右にスワイプ → 前の記録へ
        if (currentIndex > 0) {
          router.push(`/musics/${allMusics[currentIndex - 1].id}`);
        }
      }
    }

    // リセット
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (error) return <div className="text-red-500 text-center p-4">読み込みエラー</div>;
  if (!music) return <div className="text-center p-4">読み込み中...</div>;

  const currentIndex = allMusics.findIndex(d => d.id === music.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allMusics.length - 1;

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
              onClick={() => router.push(`/musics/${allMusics[currentIndex - 1].id}`)}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              ← 前の記録
            </button>
          )}
        </div>
        <div className="text-center">
          {allMusics.length > 0 && (
            <span>{currentIndex + 1} / {allMusics.length}</span>
          )}
        </div>
        <div>
          {hasNext && (
            <button
              onClick={() => router.push(`/musics/${allMusics[currentIndex + 1].id}`)}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              次の記録 →
            </button>
          )}
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-white">{music.title}</h1>

      <div className="card-basic">
        <MarkdownRenderer className="whitespace-pre-wrap">
          {music.content}
        </MarkdownRenderer>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
        <button
          onClick={() => router.push('/musics')}
          className="btn btn-secondary order-2 sm:order-1"
        >
          一覧に戻る
        </button>
        <button
          onClick={() => router.push(`/musics/edit/${music.id}`)}
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

export default MusicDetailPage;
