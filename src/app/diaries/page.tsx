'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Diary } from '@/types/diary';
import { formatMultipleDiariesForAIEvaluation, downloadFile, copyToClipboard } from '@/lib/diaryExport';

const DiaryListPage = () => {
  const [diaries, setDiaries] = useState<Diary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/diary');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Diary[] = await res.json();
        setDiaries(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, []);

  const handleExportAllForAI = async () => {
    if (!diaries || diaries.length === 0) return;
    const text = formatMultipleDiariesForAIEvaluation(diaries);
    const success = await copyToClipboard(text);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const handleDownloadAllMarkdown = () => {
    if (!diaries || diaries.length === 0) return;
    const text = formatMultipleDiariesForAIEvaluation(diaries);
    const todayStr = new Date().toISOString().split('T')[0];
    downloadFile(text, `diaries_export_${todayStr}.md`, 'text/markdown;charset=utf-8;');
  };

  const handleDownloadAllJSON = () => {
    if (!diaries || diaries.length === 0) return;
    const jsonStr = JSON.stringify(diaries, null, 2);
    const todayStr = new Date().toISOString().split('T')[0];
    downloadFile(jsonStr, `diaries_export_${todayStr}.json`, 'application/json;charset=utf-8;');
  };

  if (error) return <div className="text-red-500 text-center p-4">読み込みエラー</div>;
  if (!diaries) return <div className="text-center p-4">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">日報一覧</h1>
          <p className="text-xs text-gray-300 mt-1">全 {diaries.length} 件の日報が登録されています</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {diaries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportAllForAI}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors flex items-center gap-1.5"
                title="全日報をAI評価プロンプト付きでクリップボードにコピー"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copySuccess ? 'コピー完了！' : '全件AI評価コピー'}
              </button>
              <button
                type="button"
                onClick={handleDownloadAllMarkdown}
                className="px-3 py-2 text-xs font-medium text-gray-200 bg-gray-800/80 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors flex items-center gap-1.5"
                title="全日報をひとつのMarkdownファイルとして保存"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                一括.md保存
              </button>
              <button
                type="button"
                onClick={handleDownloadAllJSON}
                className="px-3 py-2 text-xs font-medium text-gray-200 bg-gray-800/80 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors flex items-center gap-1.5"
                title="全日報をJSONとして保存"
              >
                一括.json保存
              </button>
            </div>
          )}
          <Link href="/diaries/new" className="btn btn-primary text-center">
            新規作成
          </Link>
        </div>
      </div>

      {copySuccess && (
        <div className="p-3 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">
          ✨ 全日報のAI一括評価用プロンプトテキストをクリップボードにコピーしました！AIに貼り付けて評価をご依頼ください。
        </div>
      )}
      
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {diaries.map((diary) => (
          <li
            key={diary.id}
            className="card-basic transition-all duration-300 hover:shadow-xl hover:scale-[1.02] space-y-3"
          >
            <Link 
              href={`/diaries/${diary.id}`} 
              className="font-semibold text-lg hover:underline block text-gray-900 dark:text-white line-clamp-2"
            >
              {diary.title}
            </Link>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {diary.date 
                ? new Date(diary.date).toLocaleDateString('ja-JP') 
                : new Date(diary.created_at).toLocaleDateString('ja-JP')}
            </div>
            <MarkdownRenderer className="line-clamp-3 text-sm text-gray-700 dark:text-gray-300">
              {diary.content}
            </MarkdownRenderer>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
              <Link 
                href={`/diaries/new?copyFrom=${diary.id}`}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                title="この日報をコピーして新規作成"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                コピー作成
              </Link>
              <Link 
                href={`/diaries/${diary.id}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                続きを読む →
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {diaries.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <p className="text-lg mb-4">まだ日記がありません</p>
          <Link href="/diaries/new" className="btn btn-primary inline-block">
            最初の日記を作成
          </Link>
        </div>
      )}
    </div>
  );
};

export default DiaryListPage;
