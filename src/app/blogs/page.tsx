'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Blog } from '@/types/blog';

const BlogListPage = () => {
  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/blog');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Blog[] = await res.json();
        setBlogs(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, []);

  if (error) return <div>読み込みエラー</div>;
  if (!blogs) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">ブログ一覧</h1>
      <Link href="/blogs/new" className="bg-blue-500 text-white px-4 py-2 rounded">新規作成</Link>
      <ul className="space-y-2">
        {blogs.map((blog) => (
          <li key={blog.id} className="border p-4 rounded space-y-2">
            <Link href={`/blogs/${blog.id}`} className="font-semibold hover:underline block">
              {blog.title}
            </Link>
            <img src={blog.eyecatch} alt="eyecatch" className="w-full h-48 object-cover" />
            <p className="text-sm line-clamp-3 whitespace-pre-wrap">{blog.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogListPage;
