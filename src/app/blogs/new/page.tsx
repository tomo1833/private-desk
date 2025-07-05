'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NewBlogPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    content: '',
    content_markdown: '',
    content_html: '',
    site: '',
    author: '',
    persona: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">ブログ登録</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block">タイトル</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block">コンテンツ</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block">コンテンツ(Markdown)</label>
          <textarea
            name="content_markdown"
            value={form.content_markdown}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block">コンテンツ(HTML)</label>
          <textarea
            name="content_html"
            value={form.content_html}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block">ブログサイト</label>
          <input
            name="site"
            value={form.site}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block">著者情報</label>
          <input
            name="author"
            value={form.author}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block">ペルソナ情報</label>
          <input
            name="persona"
            value={form.persona}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          登録
        </button>
      </form>
    </div>
  );
};

export default NewBlogPage;
