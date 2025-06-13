'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { Wiki } from '@/types/wiki';

const WikiDetailPage = ({ params }: { params: { id: string } }) => {
  const { id } = React.use(params);
  const router = useRouter();
  const [wiki, setWiki] = useState<Wiki | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/wiki/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Wiki = await res.json();
        setWiki(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, [id]);

  if (error) return <div>読み込みエラー</div>;
  if (!wiki) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{wiki.title}</h1>
      <div className="markdown-body whitespace-pre-wrap border p-4 rounded bg-white">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {wiki.content}
        </ReactMarkdown>
      </div>
      <button
        onClick={() => router.push(`/wikis/edit/${wiki.id}`)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        編集
      </button>
    </div>
  );
};

export default WikiDetailPage;
