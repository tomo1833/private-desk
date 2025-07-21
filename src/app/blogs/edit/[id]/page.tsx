'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Blog } from '@/types/blog';
import BlogEditor from '@/app/components/BlogEditor';

const BlogEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    content: '',
    content_markdown: '',
    content_html: '',
    eyecatch: '',
    permalink: '',
    site: '',
    author: '',
    persona: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/blog/${id}`);
        if (!res.ok) throw new Error('読み込み失敗');
        const blog: Blog = await res.json();
        setForm({
          title: blog.title,
          content: blog.content,
          content_markdown: blog.content_markdown,
          content_html: blog.content_html,
          eyecatch: blog.eyecatch,
          permalink: blog.permalink,
          site: blog.site,
          author: blog.author,
          persona: blog.persona,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const data = await res.json();
      setForm({ ...form, eyecatch: data.url });
    } else {
      alert('画像アップロード失敗');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push(`/blogs/${id}`);
    } else {
      alert('更新失敗');
    }
  };

  const handleDelete = async () => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/blogs');
    } else {
      alert('削除失敗');
    }
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">ブログ編集</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <div>
          <label className="block text-white">タイトル</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border p-2 rounded bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">コンテンツ</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="w-full border p-2 rounded font-mono whitespace-pre bg-white"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-white">コンテンツ(Markdown)</label>
          <BlogEditor
            value={form.content_markdown}
            onChange={(value) => setForm({ ...form, content_markdown: value })}
            className="bg-white"
          />
        </div>
        <div>
          <label className="block mb-2 text-white">コンテンツ(HTML)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BlogEditor
              value={form.content_html}
              onChange={(value) => setForm({ ...form, content_html: value })}
              className="bg-white"
            />
            <div
              id="blogger-preview"
              className="border p-2 rounded bg-white min-h-[300px]"
              dangerouslySetInnerHTML={{ __html: form.content_html }}
            />
          </div>
        </div>
        <div>
          <label className="block text-white">アイキャッチ画像</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full border p-2 rounded bg-white"
            required={!form.eyecatch}
          />
          {form.eyecatch && (
            <p className="text-sm mt-1 text-gray-700">{form.eyecatch}</p>
          )}
        </div>
        <div>
          <label className="block text-white">パーマリンク</label>
          <input
            name="permalink"
            value={form.permalink}
            onChange={handleChange}
            className="w-full border p-2 rounded bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">ブログサイト</label>
          <input
            name="site"
            value={form.site}
            onChange={handleChange}
            className="w-full border p-2 rounded bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">著者情報</label>
          <input
            name="author"
            value={form.author}
            onChange={handleChange}
            className="w-full border p-2 rounded bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">ペルソナ情報</label>
          <input
            name="persona"
            value={form.persona}
            onChange={handleChange}
            className="w-full border p-2 rounded bg-white"
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="submit" className="btn btn-primary">更新</button>
          <button type="button" onClick={handleDelete} className="btn btn-danger">削除</button>
        </div>
      </form>
    </div>
  );
};

export default BlogEditPage;
