'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Subscription',
    price: 0,
    cycle: 'monthly',
    next_billing: '',
    status: 'Active',
    url: '',
    account_email: '',
    license_key: '',
    memo: '',
    display_order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('サービス名/ソフトウェア名を入力してください。');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '登録に失敗しました。');
      }

      router.push('/subscriptions');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 page-wrap max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          ➕ 新規ソフトウェア・サブスク登録
        </h1>
        <Link href="/subscriptions" className="btn btn-secondary text-sm">
          ← 戻る
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-basic space-y-4">
        {/* 名前 */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            サービス名・ソフトウェア名 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="例: Adobe Creative Cloud, ChatGPT Plus, JetBrains"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        {/* 料金 & 周期 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              料金 (円)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-500 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              課金周期
            </label>
            <select
              value={formData.cycle}
              onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="monthly">月額 (Monthly)</option>
              <option value="yearly">年額 (Yearly)</option>
              <option value="one_time">買い切り・一括 (One-time)</option>
              <option value="free">無料 (Free)</option>
            </select>
          </div>
        </div>

        {/* ステータス & 次回更新日 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              ステータス
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="Active">🟢 契約中 (Active)</option>
              <option value="Canceling">⚠️ 解約予定 (Canceling)</option>
              <option value="Canceled">⚪ 解約済 (Canceled)</option>
              <option value="Trial">🟣 お試し・検討中 (Trial)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              次回更新日・支払日
            </label>
            <input
              type="date"
              value={formData.next_billing}
              onChange={(e) => setFormData({ ...formData, next_billing: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* 登録アカウント & URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              登録アカウント (メール等)
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              value={formData.account_email}
              onChange={(e) => setFormData({ ...formData, account_email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              公式サイト / ログインURL
            </label>
            <input
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* ライセンスキー */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            ライセンスキー / シリアルコード
          </label>
          <input
            type="text"
            placeholder="XXXX-XXXX-XXXX-XXXX"
            value={formData.license_key}
            onChange={(e) => setFormData({ ...formData, license_key: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-500 text-sm font-mono"
          />
        </div>

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            メモ・解約手順等
          </label>
          <textarea
            rows={3}
            placeholder="解約期限やプラン詳細など..."
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        {/* 表示順 */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            表示順 (数字が小さいほど優先)
          </label>
          <input
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-500 text-sm font-mono"
          />
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <Link href="/subscriptions" className="btn btn-secondary text-sm">
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary text-sm disabled:opacity-50"
          >
            {loading ? '登録中...' : '登録する'}
          </button>
        </div>
      </form>
    </div>
  );
}
