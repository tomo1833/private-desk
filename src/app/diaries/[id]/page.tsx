'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Diary } from '@/types/diary';
import { formatDiaryForAIEvaluation, downloadFile, copyToClipboard } from '@/lib/diaryExport';

const DiaryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [diary, setDiary] = useState<Diary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allDiaries, setAllDiaries] = useState<Diary[]>([]);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  
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

  const handleCopyForAI = async () => {
    if (!diary) return;
    const text = formatDiaryForAIEvaluation(diary);
    const success = await copyToClipboard(text);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!diary) return;
    const text = formatDiaryForAIEvaluation(diary);
    const dateStr = diary.date || diary.created_at.split('T')[0];
    const safeTitle = diary.title.replace(/[/\\?%*:|"<>]/g, '_');
    downloadFile(text, `diary_${dateStr}_${safeTitle}.md`, 'text/markdown;charset=utf-8;');
  };

  const handleDownloadJSON = () => {
    if (!diary) return;
    const jsonStr = JSON.stringify(diary, null, 2);
    const dateStr = diary.date || diary.created_at.split('T')[0];
    const safeTitle = diary.title.replace(/[/\\?%*:|"<>]/g, '_');
    downloadFile(jsonStr, `diary_${dateStr}_${safeTitle}.json`, 'application/json;charset=utf-8;');
  };

  if (error) return <div className="text-red-500 text-center p-4">読み込みエラー</div>;
  if (!diary) return <div className="text-center p-4">読み込み中...</div>;

  const currentIndex = allDiaries.findIndex(d => d.id === diary.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allDiaries.length - 1;

  const dateDisplay = diary.date
    ? new Date(diary.date).toLocaleDateString('ja-JP')
    : new Date(diary.created_at).toLocaleDateString('ja-JP');

  return (
    <div 
      ref={containerRef}
      className="space-y-6 page-wrap"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ナビゲーション表示 */}
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
        <div>
          {hasPrev && (
            <button 
              onClick={() => router.push(`/diaries/${allDiaries[currentIndex - 1].id}`)}
              className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
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
              className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
            >
              次の日記 →
            </button>
          )}
        </div>
      </div>

      <div className="card-basic space-y-6">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{dateDisplay}</div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{diary.title}</h1>
        </div>

        {/* 日報本文 */}
        <div className="prose dark:prose-invert max-w-none">
          <MarkdownRenderer>{diary.content}</MarkdownRenderer>
        </div>

        {/* エクスポート・操作ツールバー */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyForAI}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copySuccess ? 'コピーしました！' : 'AI評価用プロンプト付きコピー'}
              </button>

              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Markdown保存 (.md)
              </button>

              <button
                type="button"
                onClick={handleDownloadJSON}
                className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors flex items-center gap-1.5"
              >
                JSON保存 (.json)
              </button>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <Link 
                href={`/diaries/edit/${diary.id}`}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                編集
              </Link>
              <Link 
                href="/diaries"
                className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:underline"
              >
                一覧に戻る
              </Link>
            </div>
          </div>

          {copySuccess && (
            <div className="p-3 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">
              ✨ クリップボードにAI評価用プロンプトテキストをコピーしました！ChatGPT / Claude / Gemini / Ollama 等に貼り付けてご利用ください。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiaryDetailPage;
