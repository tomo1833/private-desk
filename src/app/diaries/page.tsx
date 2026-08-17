'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import DiaryCards from '@/app/components/DiaryCards';
import ListControls from '@/app/components/ListControls';
import type { Diary } from '@/types/diary';
import { formatMultipleDiariesForAIEvaluation, downloadFile, copyToClipboard } from '@/lib/diaryExport';

const DiaryListPage = () => {
  const [diaries, setDiaries] = useState<Diary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const loadDiaries = async () => {
    try {
      const res = await fetch('/api/diary');
      if (!res.ok) throw new Error('読み込み失敗');
      const data: Diary[] = await res.json();
      setDiaries(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadDiaries();
  }, []);

  const filteredAndSortedDiaries = useMemo(() => {
    if (!diaries) return [];
    let list = [...diaries];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const dateA = new Date(a.date || a.created_at || 0).getTime();
      const dateB = new Date(b.date || b.created_at || 0).getTime();
      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'title') return a.title.localeCompare(b.title, 'ja');
      return 0;
    });

    return list;
  }, [diaries, searchQuery, sortBy]);

  const handleDelete = (id: number) => {
    setDiaries((prev) => (prev ? prev.filter((d) => d.id !== id) : null));
  };

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

  if (error) return <div className="text-rose-400 text-center p-6 card-basic">読み込みエラー: {error}</div>;
  if (!diaries) return <div className="text-center text-slate-300 p-8">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            📝 日報一覧
          </h1>
          <p className="text-xs text-slate-300 mt-1">日々の業務・活動ログおよびAI一括分析プロンプト連携</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {diaries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportAllForAI}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                title="全日報をAI評価プロンプト付きでクリップボードにコピー"
              >
                ✨ {copySuccess ? 'コピー完了！' : '全件AI評価コピー'}
              </button>
              <button
                type="button"
                onClick={handleDownloadAllMarkdown}
                className="px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="全日報をひとつのMarkdownファイルとして保存"
              >
                ⬇️ 一括.md保存
              </button>
              <button
                type="button"
                onClick={handleDownloadAllJSON}
                className="px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="全日報をJSONとして保存"
              >
                💾 一括.json保存
              </button>
            </div>
          )}
          <Link href="/diaries/new" className="btn btn-primary text-center">
            ➕ 新規作成
          </Link>
        </div>
      </div>

      {copySuccess && (
        <div className="p-3 text-xs bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
          ✨ 全日報のAI一括評価用プロンプトテキストをクリップボードにコピーしました！AIに貼り付けて評価をご依頼ください。
        </div>
      )}

      {/* 検索・ソート・表示切替コントロール */}
      <ListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="タイトルや日報本文で検索..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={diaries.length}
        filteredCount={filteredAndSortedDiaries.length}
      />

      {/* コンテンツ表示 */}
      {filteredAndSortedDiaries.length === 0 ? (
        <div className="card-basic text-center py-12 text-slate-400 space-y-3">
          <p className="text-lg font-medium">該当する日報が見つかりませんでした</p>
          <Link href="/diaries/new" className="btn btn-primary inline-block text-sm">
            最初の日記を作成
          </Link>
        </div>
      ) : (
        <DiaryCards diaries={filteredAndSortedDiaries} viewMode={viewMode} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default DiaryListPage;
