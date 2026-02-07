'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogEditor from '@/app/components/BlogEditor';
import { marked } from 'marked';
import TurndownService from 'turndown';

const NewBlogPage = () => {
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
  const [prompt, setPrompt] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push('/blogs');
    } else {
      alert('登録失敗');
    }
  };

  const handleGenerate = async () => {
    const res = await fetch('/api/blog/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (res.ok) {
      const data = await res.json();
      const generated = data.response ?? data.content ?? '';
      setForm({ ...form, content: generated });
    } else {
      alert('生成失敗');
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

  return (
    <div className="card-form">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">ブログ登録</h1>
        <p className="form-subtitle">新しいブログ記事を作成・投稿します</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 mb-6">
          <label className="form-label">生成プロンプト</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="form-textarea font-mono whitespace-pre"
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-2">
            <button
              type="button"
              onClick={handleGenerate}
              className="btn btn-generate"
            >
              ブログ生成
            </button>
          </div>
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">タイトル</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">コンテンツ</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="form-textarea font-mono whitespace-pre"
            rows={4}
            required
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">コンテンツ(Markdown)</label>
          <BlogEditor
            value={form.content_markdown}
            onChange={(value) => setForm({ ...form, content_markdown: value })}
            className="bg-white"
          />
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-2">
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
          <label className="form-label">アイキャッチ画像</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            required={!form.eyecatch}
          />
          {form.eyecatch && (
            <p className="text-sm mt-1 text-gray-700">{form.eyecatch}</p>
          )}
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">パーマリンク</label>
          <input
            name="permalink"
            value={form.permalink}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">ブログサイト</label>
          <input
            name="site"
            value={form.site}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">著者情報</label>
          <input
            name="author"
            value={form.author}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">ペルソナ情報</label>
          <input
            name="persona"
            value={form.persona}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="btn-group-between pt-4 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/blogs')}
            className="btn btn-secondary"
          >
            キャンセル
          </button>
          <button type="submit" className="btn btn-primary">
            登録
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBlogPage;
