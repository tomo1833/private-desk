'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Blog } from '@/types/blog';
import BlogEditor from '@/app/components/BlogEditor';
import { marked } from 'marked';
import TurndownService from 'turndown';

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

  const markdownToHtml = () => {
    setForm({
      ...form,
      content_html: marked(form.content_markdown, { async: false }),
    });
  };

  const htmlToMarkdown = () => {
    const turndownService = new TurndownService();
    setForm({
      ...form,
      content_markdown: turndownService.turndown(form.content_html),
    });
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 space-y-6 border border-white/40 shadow-lg">
      <div className="form-header">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">ブログ編集</h1>
        <p className="form-subtitle">ブログ記事の編集・更新を行います</p>
      </div>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">タイトル</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
            required
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">コンテンツ</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="form-textarea font-mono whitespace-pre w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 min-h-24 resize-vertical"
            rows={4}
            required
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">コンテンツ(Markdown)</label>
          <BlogEditor
            value={form.content_markdown}
            onChange={(value) => setForm({ ...form, content_markdown: value })}
            className="bg-white"
          />
          <div className="btn-group mt-2">
            <button
              type="button"
              onClick={markdownToHtml}
              className="btn btn-convert btn-sm"
            >
              Markdown→HTML
            </button>
            <button
              type="button"
              onClick={htmlToMarkdown}
              className="btn btn-convert btn-sm"
            >
              HTML→Markdown
            </button>
          </div>
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label mb-2">コンテンツ(HTML)</label>
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
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">アイキャッチ画像</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="form-file"
            required={!form.eyecatch}
          />
          {form.eyecatch && (
            <p className="text-sm mt-1 text-gray-700">{form.eyecatch}</p>
          )}
        </div>
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">パーマリンク</label>
          <input
            name="permalink"
            value={form.permalink}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
            required
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">ブログサイト</label>
          <input
            name="site"
            value={form.site}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
            required
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">著者情報</label>
          <input
            name="author"
            value={form.author}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
            required
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">ペルソナ情報</label>
          <input
            name="persona"
            value={form.persona}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
            required
          />
        </div>
        <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
          <div className="btn-group-left">
            <button
              type="button"
              onClick={() => router.push('/blogs')}
              className="btn btn-secondary"
            >
              キャンセル
            </button>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary">更新</button>
            <button type="button" onClick={handleDelete} className="btn btn-danger">削除</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogEditPage;
