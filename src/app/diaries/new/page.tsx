'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Diary } from '@/types/diary';

const NewDiaryForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copyFromId = searchParams.get('copyFrom');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isLoadingCopy, setIsLoadingCopy] = useState(false);
  const [copyStatusMessage, setCopyStatusMessage] = useState<string | null>(null);

  // Handle copyFrom parameter when loaded
  useEffect(() => {
    if (!copyFromId) return;
    const fetchCopyTarget = async () => {
      setIsLoadingCopy(true);
      try {
        const res = await fetch(`/api/diary/${copyFromId}`);
        if (res.ok) {
          const data: Diary = await res.json();
          setTitle(data.title);
          setContent(data.content);
          setCopyStatusMessage('指定された日報から内容をコピーしました');
        }
      } catch (err) {
        console.error('Failed to copy diary:', err);
      } finally {
        setIsLoadingCopy(false);
      }
    };
    fetchCopyTarget();
  }, [copyFromId]);

  // Handle copying the latest (yesterday/previous) diary
  const handleCopyLatest = async () => {
    setIsLoadingCopy(true);
    setCopyStatusMessage(null);
    try {
      const res = await fetch('/api/diary?limit=1');
      if (res.ok) {
        const data: Diary[] = await res.json();
        if (data && data.length > 0) {
          setTitle(data[0].title);
          setContent(data[0].content);
          setCopyStatusMessage('直近の日報から内容をコピーしました');
        } else {
          setCopyStatusMessage('コピー可能な過去の日報が見つかりませんでした');
        }
      } else {
        setCopyStatusMessage('過去の日報の取得に失敗しました');
      }
    } catch (err) {
      console.error('Failed to copy latest diary:', err);
      setCopyStatusMessage('エラーが発生しました');
    } finally {
      setIsLoadingCopy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, date, display_order: displayOrder }),
    });
    if (res.ok) {
      router.push('/diaries');
    } else {
      alert('登録失敗');
    }
  };

  return (
    <div className="space-y-6 page-wrap max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>📝</span> 日報新規作成
          </h1>
          <p className="text-xs text-slate-300 mt-1">本日の出来事・進捗・所感を記録します</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopyLatest}
            disabled={isLoadingCopy}
            className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            📋 {isLoadingCopy ? 'コピー中...' : '前回の（昨日の）日報をコピー'}
          </button>
          <Link href="/diaries" className="btn btn-secondary text-xs">
            ← 一覧に戻る
          </Link>
        </div>
      </div>

      {copyStatusMessage && (
        <div className="p-3 text-xs bg-indigo-500/20 text-indigo-200 rounded-xl border border-indigo-500/40 font-medium">
          ✓ {copyStatusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-form space-y-4 shadow-2xl border border-indigo-500/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="diary-title" className="form-label text-xs">タイトル <span className="text-rose-400">*</span></label>
            <input id="diary-title" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input text-xs" required placeholder="例: 本日の進捗とタスク完了" />
          </div>
          <div>
            <label htmlFor="diary-date" className="form-label text-xs">日付 <span className="text-rose-400">*</span></label>
            <input
              id="diary-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input text-xs font-mono"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="diary-display-order" className="form-label text-xs">表示順</label>
          <input
            id="diary-display-order"
            type="number"
            min={0}
            step={1}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="form-input text-xs font-mono"
          />
        </div>

        <div>
          <label htmlFor="diary-content" className="form-label text-xs">本文内容 (Markdown対応) <span className="text-rose-400">*</span></label>
          <textarea id="diary-content" value={content} onChange={(e) => setContent(e.target.value)} className="form-textarea text-xs min-h-36 font-mono" rows={8} required placeholder="業務内容、振り返り、翌日のタスクなど..." />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/80">
          <Link href="/diaries" className="btn btn-secondary text-xs px-3.5 py-1.5">
            キャンセル
          </Link>
          <button type="submit" className="btn btn-primary text-xs px-4 py-1.5">
            登録する
          </button>
        </div>
      </form>
    </div>
  );
};

const NewDiaryPage = () => {
  return (
    <Suspense fallback={<div className="page-wrap text-center p-8 text-slate-300 card-basic">読み込み中...</div>}>
      <NewDiaryForm />
    </Suspense>
  );
};

export default NewDiaryPage;
