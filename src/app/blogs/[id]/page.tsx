'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Blog } from '@/types/blog';

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/blog/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Blog = await res.json();
        setBlog(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, [id]);

  if (error) return <div>読み込みエラー</div>;
  if (!blog) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{blog.title}</h1>
      <Image
        src={blog.eyecatch}
        alt="eyecatch"
        width={600}
        height={192}
        className="w-full h-48 object-cover"
      />
      <p className="text-sm text-blue-600 underline">{blog.permalink}</p>

      <MarkdownRenderer className="whitespace-pre-wrap border p-4 rounded bg-white">
        {blog.content_markdown}
      </MarkdownRenderer>

      <div className="flex justify-end">
        <button
          onClick={() => router.push(`/blogs/edit/${blog.id}`)}
          className="btn btn-primary"
        >
          編集
        </button>
      </div>
    </div>
  );
};

export default BlogDetailPage;
