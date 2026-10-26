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

    const swipeThreshold = 50;
    const swipeDistance = touchStartX.current - touchEndX.current;
    const currentIndex = allDiaries.findIndex(d => d.id === diary.id);
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        if (currentIndex < allDiaries.length - 1) {
          router.push(`/diaries/${allDiaries[currentIndex + 1].id}`);
        }
      } else {
        if (currentIndex > 0) {
          router.push(`/diaries/${allDiaries[currentIndex - 1].id}`);
        }
      }
    }

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

  if (error) return <div className="page-wrap p-8 text-center text-rose-400 card-basic">読み込みエラー</div>;
  if (!diary) return <div className="page-wrap p-8 text-center text-slate-300 card-basic">読み込み中...</div>;

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
      <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
        <div>
          {hasPrev && (
            <button 
              onClick={() => router.push(`/diaries/${allDiaries[currentIndex - 1].id}`)}
              className="hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              ← 前の日記
            </button>
          )}
        </div>
        <div className="text-center font-mono">
          {allDiaries.length > 0 && (
            <span>{currentIndex + 1} / {allDiaries.length}</span>
          )}
        </div>
        <div>
          {hasNext && (
            <button 
              onClick={() => router.push(`/diaries/${allDiaries[currentIndex + 1].id}`)}
              className="hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              次の日記 →
            </button>
          )}
        </div>
      </div>

      <div className="card-basic space-y-6 p-6">
        <div className="border-b border-slate-700/80 pb-4">
          <div className="text-xs font-semibold text-indigo-400 mb-1 font-mono">{dateDisplay}</div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{diary.title}</h1>
        </div>

        {/* 日報本文 */}
        <div className="prose prose-invert max-w-none text-slate-100 leading-relaxed">
          <MarkdownRenderer>{diary.content}</MarkdownRenderer>
        </div>

        {/* エクスポート・操作ツールバー */}
        <div className="pt-6 border-t border-slate-700/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyForAI}
                className="btn btn-primary text-xs flex items-center gap-1.5"
              >
                🤖 {copySuccess ? 'コピーしました！' : 'AI評価用プロンプト付きコピー'}
              </button>

              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="btn btn-secondary text-xs flex items-center gap-1.5"
              >
                📥 Markdown保存 (.md)
              </button>

              <button
                type="button"
                onClick={handleDownloadJSON}
                className="btn btn-secondary text-xs flex items-center gap-1.5"
              >
                💾 JSON保存 (.json)
              </button>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <Link 
                href={`/diaries/edit/${diary.id}`}
                className="btn btn-success text-xs px-3 py-1.5"
              >
                編集
              </Link>
              <Link 
                href="/diaries"
                className="btn btn-secondary text-xs px-3 py-1.5"
              >
                一覧に戻る
              </Link>
            </div>
          </div>

          {copySuccess && (
            <div className="p-3 text-xs bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
              ✨ クリップボードにAI評価用プロンプトテキストをコピーしました！ChatGPT / Claude / Gemini / Ollama 等に貼り付けてご利用ください。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiaryDetailPage;
