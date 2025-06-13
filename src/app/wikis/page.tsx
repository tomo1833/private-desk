'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { Wiki } from '@/types/wiki';

const WikiListPage = () => {
  const [wikis, setWikis] = useState<Wiki[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/wiki');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Wiki[] = await res.json();
        setWikis(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, []);

  if (error) return <div>読み込みエラー</div>;
  if (!wikis) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Wiki一覧</h1>
      <Link href="/wikis/new" className="bg-blue-500 text-white px-4 py-2 rounded">新規作成</Link>
      <ul className="space-y-2">
        {wikis.map((wiki) => (
          <li key={wiki.id} className="border p-4 rounded space-y-2">
            <Link
              href={`/wikis/${wiki.id}`}
              className="font-semibold hover:underline block"
            >
              {wiki.title}
            </Link>
            <div className="markdown-body line-clamp-3 text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {wiki.content}
              </ReactMarkdown>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WikiListPage;
