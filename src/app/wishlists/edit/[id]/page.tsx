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
      <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 id="wishlist-form-title" className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span>✏️</span> 欲しいものを編集
          </h1>
          <p className="text-xs text-slate-400 mt-1">アイテム情報の変更</p>
        </div>
        <Link href="/wishlists" className="btn btn-secondary text-xs">
          ← 一覧へ戻る
        </Link>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-800 bg-rose-950/40 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      <form aria-labelledby="wishlist-form-title" onSubmit={handleSubmit} className="card-form space-y-5">
        {/* 品名 */}
        <div>
          <label htmlFor="wishlist-title" className="form-label">
            品名 / アイテム名 <span className="text-rose-400">*</span>
          </label>
          <input
            id="wishlist-title"
            type="text"
            required
            placeholder="例: Keychron Q1 Pro キーボード"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="form-input"
          />
        </div>

        {/* カテゴリ & 価格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="wishlist-category" className="form-label">カテゴリ</label>
            <select
              id="wishlist-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-select"
            >
              {CATEGORY_PRESETS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="CUSTOM">＋ 直接入力...</option>
            </select>
            {formData.category === 'CUSTOM' && (
              <div className="mt-3">
                <label htmlFor="wishlist-custom-category" className="form-label">
                  新しいカテゴリ名
                </label>
                <input
                  id="wishlist-custom-category"
                  type="text"
                  placeholder="カテゴリ名を入力"
                  value={formData.customCategory}
                  onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                  className="form-input"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="wishlist-price" className="form-label">予想価格 (円)</label>
            <input
              id="wishlist-price"
              type="number"
              min="0"
              placeholder="例: 32800"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="form-input font-mono"
            />
          </div>
        </div>

        {/* 優先度 & ステータス */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="wishlist-priority" className="form-label">優先度</label>
            <select
              id="wishlist-priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="form-select"
            >
              <option value="High">高 ★★★ (今すぐ欲しい)</option>
              <option value="Medium">中 ★★☆ (そのうち欲しい)</option>
              <option value="Low">低 ★☆☆ (気になる程度)</option>
            </select>
          </div>

          <div>
            <label htmlFor="wishlist-status" className="form-label">ステータス</label>
            <select
              id="wishlist-status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="form-select"
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
          <label htmlFor="wishlist-url" className="form-label">商品ページURL (任意)</label>
          <input
            id="wishlist-url"
            type="url"
            placeholder="https://www.amazon.co.jp/dp/..."
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="form-input"
          />
        </div>

        {/* 画像URL */}
        <div>
          <label htmlFor="wishlist-image-url" className="form-label">画像URL (任意)</label>
          <input
            id="wishlist-image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="form-input"
          />
        </div>

        {/* メモ */}
        <div>
          <label htmlFor="wishlist-memo" className="form-label">メモ・欲しい理由 (任意)</label>
          <textarea
            id="wishlist-memo"
            rows={4}
            placeholder="メモ内容..."
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            className="form-textarea"
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
