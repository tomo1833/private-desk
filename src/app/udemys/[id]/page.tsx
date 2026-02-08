'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Udemy } from '@/types/udemy';

const UdemyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [udemy, setUdemy] = useState<Udemy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allUdemys, setAllUdemys] = useState<Udemy[]>([]);
  
  // スワイプ機能用
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUdemys = async () => {
      try {
        const res = await fetch('/api/udemy');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Udemy[] = await res.json();
        setAllUdemys(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadUdemys();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/udemy/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Udemy = await res.json();
        setUdemy(data);
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
    if (!udemy || allUdemys.length === 0) return;

    const swipeThreshold = 50; // スワイプの閾値（ピクセル）
    const swipeDistance = touchStartX.current - touchEndX.current;

    const currentIndex = allUdemys.findIndex(d => d.id === udemy.id);
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // 左にスワイプ → 次の記録へ
        if (currentIndex < allUdemys.length - 1) {
          router.push(`/udemys/${allUdemys[currentIndex + 1].id}`);
        }
      } else {
        // 右にスワイプ → 前の記録へ
        if (currentIndex > 0) {
          router.push(`/udemys/${allUdemys[currentIndex - 1].id}`);
        }
      }
    }

    // リセット
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (error) return <div className="text-red-500 text-center p-4">読み込みエラー</div>;
  if (!udemy) return <div className="text-center p-4">読み込み中...</div>;

  const currentIndex = allUdemys.findIndex(d => d.id === udemy.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allUdemys.length - 1;

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
              onClick={() => router.push(`/udemys/${allUdemys[currentIndex - 1].id}`)}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              ← 前の記録
            </button>
          )}
        </div>
        <div className="text-center">
          {allUdemys.length > 0 && (
            <span>{currentIndex + 1} / {allUdemys.length}</span>
          )}
        </div>
        <div>
          {hasNext && (
            <button 
              onClick={() => router.push(`/udemys/${allUdemys[currentIndex + 1].id}`)}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              次の記録 →
            </button>
          )}
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-white">{udemy.title}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg">
        <MarkdownRenderer className="whitespace-pre-wrap">
          {udemy.content}
        </MarkdownRenderer>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
        <button 
          onClick={() => router.push('/udemys')} 
          className="btn btn-secondary order-2 sm:order-1"
        >
          一覧に戻る
        </button>
        <button 
          onClick={() => router.push(`/udemys/edit/${udemy.id}`)} 
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

export default UdemyDetailPage;
