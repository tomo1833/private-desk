'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    display_order: 0,
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
          display_order: blog.display_order ?? 0,
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

  if (loading) return <div className="page-wrap p-8 text-center text-slate-300 card-basic">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>✏️</span> ブログ記事編集
          </h1>
          <p className="text-xs text-slate-300 mt-1">ブログ記事の編集・更新・削除を行います</p>
        </div>
        <Link href={`/blogs/${id}`} className="btn btn-secondary text-xs">
          ← 詳細へ戻る
        </Link>
      </div>

      <form onSubmit={handleUpdate} className="card-form space-y-5 shadow-2xl border border-indigo-500/30">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="form-label text-xs">タイトル <span className="text-rose-400">*</span></label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="form-input text-xs"
              required
            />
          </div>
          <div>
            <label className="form-label text-xs">表示順</label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.display_order}
              onChange={(e) =>
                setForm({ ...form, display_order: Number(e.target.value) })
              }
              className="form-input text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="form-label text-xs">本文概要 / コンテンツ <span className="text-rose-400">*</span></label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="form-textarea font-mono whitespace-pre text-xs min-h-28"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="form-label text-xs">コンテンツ (Markdown)</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={markdownToHtml}
                className="btn btn-secondary text-[11px] px-2.5 py-1"
              >
                Markdown → HTML 変換
              </button>
              <button
                type="button"
                onClick={htmlToMarkdown}
                className="btn btn-secondary text-[11px] px-2.5 py-1"
              >
                HTML → Markdown 変換
              </button>
            </div>
          </div>
          <BlogEditor
            value={form.content_markdown}
            onChange={(value) => setForm({ ...form, content_markdown: value })}
            className="bg-slate-900/60 rounded-xl border border-slate-700/80 p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="form-label text-xs">コンテンツ (HTML & プレビュー)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BlogEditor
              value={form.content_html}
              onChange={(value) => setForm({ ...form, content_html: value })}
              className="bg-slate-900/60 rounded-xl border border-slate-700/80 p-2"
            />
            <div
              id="blogger-preview"
              className="border border-slate-700/80 p-4 rounded-xl bg-slate-950 text-slate-100 text-xs min-h-[250px] overflow-auto leading-relaxed"
              dangerouslySetInnerHTML={{ __html: form.content_html || '<span class="text-slate-400">プレビューがここに表示されます</span>' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label text-xs">アイキャッチ画像</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="form-input text-xs"
            />
            {form.eyecatch && (
              <p className="text-[11px] font-mono text-emerald-400 mt-1 truncate">画像URL: {form.eyecatch}</p>
            )}
          </div>
          <div>
            <label className="form-label text-xs">パーマリンク <span className="text-rose-400">*</span></label>
            <input
              name="permalink"
              value={form.permalink}
              onChange={handleChange}
              className="form-input text-xs font-mono"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label text-xs">ブログサイト <span className="text-rose-400">*</span></label>
            <input
              name="site"
              value={form.site}
              onChange={handleChange}
              className="form-input text-xs"
              required
            />
          </div>
          <div>
            <label className="form-label text-xs">著者情報 <span className="text-rose-400">*</span></label>
            <input
              name="author"
              value={form.author}
              onChange={handleChange}
              className="form-input text-xs"
              required
            />
          </div>
          <div>
            <label className="form-label text-xs">ペルソナ情報 <span className="text-rose-400">*</span></label>
            <input
              name="persona"
              value={form.persona}
              onChange={handleChange}
              className="form-input text-xs"
              required
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-700/80">
          <Link href={`/blogs/${id}`} className="btn btn-secondary text-xs px-3.5 py-1.5">
            キャンセル
          </Link>
          <div className="flex gap-2">
            <button type="button" onClick={handleDelete} className="btn btn-danger text-xs px-3.5 py-1.5">
              削除
            </button>
            <button type="submit" className="btn btn-primary text-xs px-4 py-1.5">
              更新する
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogEditPage;
