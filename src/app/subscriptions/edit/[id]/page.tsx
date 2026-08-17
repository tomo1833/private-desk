'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/subscriptions/${id}`);
        if (!res.ok) throw new Error('データ取得に失敗しました。');
        const data = await res.json();
        setFormData({
          name: data.name || '',
          category: data.category || 'Subscription',
          price: data.price || 0,
          cycle: data.cycle || 'monthly',
          next_billing: data.next_billing || '',
          status: data.status || 'Active',
          url: data.url || '',
          account_email: data.account_email || '',
          license_key: data.license_key || '',
          memo: data.memo || '',
          display_order: data.display_order || 0,
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('サービス名/ソフトウェア名を入力してください。');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '更新に失敗しました。');
      }

      router.push(`/subscriptions/${id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-wrap text-center text-slate-300 p-8 card-basic">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
          <span>✏️</span> サブスク・ソフトウェア情報編集
        </h1>
        <Link href={`/subscriptions/${id}`} className="btn btn-secondary text-xs">
          ← 詳細へ戻る
        </Link>
      </div>

      {error && (
        <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-form space-y-4 shadow-2xl border border-indigo-500/30">
        {/* 名前 */}
        <div>
          <label className="form-label text-xs">
            サービス名・ソフトウェア名 <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input text-xs"
          />
        </div>

        {/* 料金 & 周期 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label text-xs">
              料金 (円)
            </label>
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="form-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="form-label text-xs">
              課金周期
            </label>
            <select
              value={formData.cycle}
              onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
              className="form-input text-xs"
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
            <label className="form-label text-xs">
              ステータス
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="form-input text-xs"
            >
              <option value="Active">🟢 契約中 (Active)</option>
              <option value="Canceling">⚠️ 解約予定 (Canceling)</option>
              <option value="Canceled">⚪ 解約済 (Canceled)</option>
              <option value="Trial">🟣 お試し・検討中 (Trial)</option>
            </select>
          </div>

          <div>
            <label className="form-label text-xs">
              次回更新日・支払日
            </label>
            <input
              type="date"
              value={formData.next_billing}
              onChange={(e) => setFormData({ ...formData, next_billing: e.target.value })}
              className="form-input text-xs font-mono"
            />
          </div>
        </div>

        {/* 登録アカウント & URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label text-xs">
              登録アカウント (メール等)
            </label>
            <input
              type="email"
              value={formData.account_email}
              onChange={(e) => setFormData({ ...formData, account_email: e.target.value })}
              className="form-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="form-label text-xs">
              公式サイト / ログインURL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="form-input text-xs font-mono"
            />
          </div>
        </div>

        {/* ライセンスキー */}
        <div>
          <label className="form-label text-xs">
            ライセンスキー / シリアルコード
          </label>
          <input
            type="text"
            value={formData.license_key}
            onChange={(e) => setFormData({ ...formData, license_key: e.target.value })}
            className="form-input text-xs font-mono"
          />
        </div>

        {/* メモ */}
        <div>
          <label className="form-label text-xs">
            メモ・解約手順等
          </label>
          <textarea
            rows={3}
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            className="form-textarea text-xs"
          />
        </div>

        {/* 表示順 */}
        <div>
          <label className="form-label text-xs">
            表示順 (数字が小さいほど優先)
          </label>
          <input
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
            className="form-input text-xs font-mono"
          />
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/80">
          <Link href={`/subscriptions/${id}`} className="btn btn-secondary text-xs px-3.5 py-1.5">
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary text-xs px-4 py-1.5 disabled:opacity-50"
          >
            {submitting ? '保存中...' : '更新を保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
