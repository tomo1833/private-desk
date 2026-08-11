'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    <div className="card-form">
      <div className="form-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="form-title">日報作成</h1>
          <p className="form-subtitle">新しい日報を作成します</p>
        </div>
        <button
          type="button"
          onClick={handleCopyLatest}
          disabled={isLoadingCopy}
          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {isLoadingCopy ? '読み込み中...' : '前回の（昨日の）日報をコピー'}
        </button>
      </div>

      {copyStatusMessage && (
        <div className="mt-3 p-3 text-sm bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 rounded-lg border border-blue-200 dark:border-blue-800">
          {copyStatusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <div className="space-y-4 mb-6">
          <label htmlFor="diary-title" className="form-label">タイトル</label>
          <input id="diary-title" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" required />
        </div>
        <div className="space-y-4 mb-6">
          <label htmlFor="diary-date" className="form-label">日付</label>
          <input
            id="diary-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="space-y-4 mb-6">
          <label htmlFor="diary-display-order" className="form-label">表示順</label>
          <input
            id="diary-display-order"
            type="number"
            min={0}
            step={1}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="form-input"
          />
        </div>
        <div className="space-y-4 mb-6">
          <label htmlFor="diary-content" className="form-label">内容</label>
          <textarea id="diary-content" value={content} onChange={(e) => setContent(e.target.value)} className="form-textarea min-h-24" rows={6} required />
        </div>
        <div className="btn-group-between pt-4 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/diaries')}
            className="btn btn-secondary"
          >
            キャンセル
          </button>
          <button type="submit" className="btn btn-primary">
            登録
          </button>
        </div>
      </form>
    </div>
  );
};

const NewDiaryPage = () => {
  return (
    <Suspense fallback={<div className="text-center p-4">読み込み中...</div>}>
      <NewDiaryForm />
    </Suspense>
  );
};

export default NewDiaryPage;
