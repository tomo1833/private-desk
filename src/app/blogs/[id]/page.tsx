'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Blog } from '@/types/blog';

const BlogDetailPage = ({ params }: { params: { id: string } }) => {
  const { id } = React.use(params);
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
      <div className="whitespace-pre-wrap border p-4 rounded bg-white">
        {blog.content}
      </div>
      <button
        onClick={() => router.push(`/blogs/edit/${blog.id}`)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        編集
      </button>
    </div>
  );
};

export default BlogDetailPage;
