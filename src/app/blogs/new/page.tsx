'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogEditor from '@/app/components/BlogEditor';

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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">ブログ登録</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block text-white">生成プロンプト</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full border p-2 rounded font-mono whitespace-pre bg-white"
            rows={4}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              className="btn btn-success mt-2"
            >
              ブログ生成
            </button>
          </div>
        </div>
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
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">
            登録
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBlogPage;
