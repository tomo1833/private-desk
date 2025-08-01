'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Blog } from '@/types/blog';

const BlogListPage = () => {
  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

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

  const handleImport = async () => {
    setImporting(true);
    const res = await fetch('/api/blog/import-blogger', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      console.log('import result', data);
      location.reload();
    } else {
      alert('取り込み失敗');
    }
    setImporting(false);
  };

  if (error) return <div>読み込みエラー</div>;
  if (!blogs) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">ブログ一覧</h1>
      <div className="flex flex-wrap justify-end gap-2 my-4">
        <Link href="/blogs/new" className="btn btn-primary">新規作成</Link>
        <Link href="/authors/new" className="btn btn-success">著者登録</Link>
        <Link href="/authors" className="btn btn-success">著者一覧</Link>
        <Link href="/personas/new" className="btn btn-purple">ペルソナ登録</Link>
        <Link href="/personas" className="btn btn-purple">ペルソナ一覧</Link>
        <button
          onClick={handleImport}
          disabled={importing}
          className="btn btn-danger"
        >
          {importing ? '同期中...' : 'Blogger同期'}
        </button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/blog/export-blogger"
          className="btn btn-warning"
        >
          Bloggerエクスポート
        </a>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {blogs.map((blog) => (
          <li key={blog.id} className="bg-white/90 border p-4 rounded space-y-2">
            <Link href={`/blogs/${blog.id}`} className="font-semibold hover:underline block">
              {blog.title}
            </Link>
            <Image
              src={blog.eyecatch}
              alt="eyecatch"
              width={600}
              height={192}
              className="w-full h-48 object-cover"
            />
            <p className="text-sm line-clamp-3 whitespace-pre-wrap">{blog.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogListPage;
