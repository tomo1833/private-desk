'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PasswordCards from '../components/PasswordCards';
import DiaryCards from '../components/DiaryCards';
import WikiCards from '../components/WikiCards';
import BlogCards from '../components/BlogCards';
import type { Password } from '@/types/password';
import type { Diary } from '@/types/diary';
import type { Wiki } from '@/types/wiki';
import type { Blog } from '@/types/blog';

interface Results {
  passwords: Password[];
  diaries: Diary[];
  wikis: Wiki[];
  blogs: Blog[];
}

const SearchPage = () => {
  const params = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [useLLM, setUseLLM] = useState(true);

  useEffect(() => {
    if (!q) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('検索に失敗しました');
        const data: Results = await res.json();
        setResults(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, [q]);

  const handleSummarize = async () => {
    if (!q) return;
    setIsSummarizing(true);
    setSummary(null);
    setSummaryError(null);
    try {
      const res = await fetch(
        `/api/mcp/search-summary?q=${encodeURIComponent(q)}&llm=${useLLM ? '1' : '0'}`
      );

      if (!res.ok) {
        throw new Error('要約生成に失敗しました');
      }
      const data: { summary: string } = await res.json();
      setSummary(data.summary || '要約結果がありませんでした。');
    } catch (err) {
      setSummaryError((err as Error).message);
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!q) return <div className="p-4 text-gray-700 dark:text-gray-300">検索ワードを入力してください。</div>;
  if (error) return <div className="p-4 text-red-600 dark:text-red-400">{error}</div>;
  if (!results) return <div className="p-4 text-gray-700 dark:text-gray-300">検索中...</div>;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-white">検索結果: {q}</h1>
      <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">MCP 要約</h2>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 accent-indigo-500"
                checked={!useLLM}
                onChange={(event) => setUseLLM(!event.target.checked)}
              />
              LLMを使わない
            </label>
            <button
              type="button"
              onClick={handleSummarize}
              className="rounded bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-600"
              disabled={isSummarizing}
            >
              {isSummarizing ? '要約中...' : '要約生成'}
            </button>
          </div>

        </div>
        {summaryError ? (
          <p className="mt-3 text-sm text-red-400">{summaryError}</p>
        ) : summary ? (
          <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-200">{summary}</pre>
        ) : (
          <p className="mt-3 text-sm text-slate-400">検索結果を要約します。</p>
        )}
      </section>
      <section>
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">パスワード</h2>
        {results.passwords.length > 0 ? (
          <PasswordCards passwords={results.passwords} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">該当なし</p>
        )}
      </section>
      <section>
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Wiki</h2>
        {results.wikis.length > 0 ? (
          <WikiCards wikis={results.wikis} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">該当なし</p>
        )}
      </section>
      <section>
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">日報</h2>
        {results.diaries.length > 0 ? (
          <DiaryCards diaries={results.diaries} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">該当なし</p>
        )}
      </section>
      <section>
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">ブログ</h2>
        {results.blogs.length > 0 ? (
          <BlogCards blogs={results.blogs} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">該当なし</p>
        )}
      </section>
    </div>
  );
};

export default SearchPage;
