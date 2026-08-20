'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORY_PRESETS = [
  'ガジェット',
  'ファッション',
  '家電',
  '本・書籍',
  '生活用品',
  '趣味・ゲーム',
  'インテリア',
  'ソフトウェア',
  'その他',
];

export default function EditWishlistItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'ガジェット',
    customCategory: '',
    price: '',
    priority: 'Medium',
    status: 'Wanted',
    url: '',
    image_url: '',
    memo: '',
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/wishlist/${id}`);
        if (!res.ok) throw new Error('アイテムの読み込みに失敗しました');
        const data = await res.json();

        const isPreset = CATEGORY_PRESETS.includes(data.category);

        setFormData({
          title: data.title || '',
          category: isPreset ? data.category || 'その他' : 'CUSTOM',
          customCategory: isPreset ? '' : data.category || '',
          price: data.price !== null && data.price !== undefined ? String(data.price) : '',
          priority: data.priority || 'Medium',
          status: data.status || 'Wanted',
          url: data.url || '',
          image_url: data.image_url || data.imageUrl || '',
          memo: data.memo || '',
        });
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('品名は必須項目です');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const finalCategory =
        formData.category === 'CUSTOM'
          ? formData.customCategory.trim() || 'その他'
          : formData.category;

      const res = await fetch(`/api/wishlist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          category: finalCategory,
          price: formData.price ? Number(formData.price) : 0,
          priority: formData.priority,
          status: formData.status,
          url: formData.url.trim() || null,
          image_url: formData.image_url.trim() || null,
          memo: formData.memo.trim() || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '更新に失敗しました');
      }

      router.push('/wishlists');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm animate-pulse">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span>✏️</span> 欲しいものを編集
          </h1>
          <p className="text-xs text-slate-400 mt-1">アイテム情報の変更</p>
        </div>
        <Link href="/wishlists" className="btn btn-secondary text-xs">
          ← 一覧へ戻る
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-basic space-y-5 bg-slate-900/70 backdrop-blur-xl border-slate-800">
        {/* 品名 */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            品名 / アイテム名 <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="例: Keychron Q1 Pro キーボード"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* カテゴリ & 価格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">カテゴリ</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
            >
              {CATEGORY_PRESETS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="CUSTOM">＋ 直接入力...</option>
            </select>
            {formData.category === 'CUSTOM' && (
              <input
                type="text"
                placeholder="新しいカテゴリ名"
                value={formData.customCategory}
                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">予想価格 (円)</label>
            <input
              type="number"
              min="0"
              placeholder="例: 32800"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* 優先度 & ステータス */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">優先度</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
            >
              <option value="High">高 ★★★ (今すぐ欲しい)</option>
              <option value="Medium">中 ★★☆ (そのうち欲しい)</option>
              <option value="Low">低 ★☆☆ (気になる程度)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">ステータス</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
            >
              <option value="Wanted">🎁 欲しい (未購入)</option>
              <option value="Considering">🤔 検討中</option>
              <option value="Purchased">✅ 購入済み</option>
              <option value="Archived">📦 見送り</option>
            </select>
          </div>
        </div>

        {/* 商品URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">商品ページURL (任意)</label>
          <input
            type="url"
            placeholder="https://www.amazon.co.jp/dp/..."
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
          />
        </div>

        {/* 画像URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">画像URL (任意)</label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
          />
        </div>

        {/* メモ */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">メモ・欲しい理由 (任意)</label>
          <textarea
            rows={4}
            placeholder="メモ内容..."
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
          />
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Link href="/wishlists" className="btn btn-secondary text-xs sm:text-sm">
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary text-xs sm:text-sm px-6 disabled:opacity-50"
          >
            {submitting ? '更新中...' : '💾 変更を保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
