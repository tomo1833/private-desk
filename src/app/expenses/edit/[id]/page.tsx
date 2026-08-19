'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import type { Expense } from '@/types/expense';

const ExpenseEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<{
    category: string;
    amount: string;
    shop: string;
    used_by: string | null;
    product_name: string | null;
    remark: string | null;
    used_at: string;
    display_order: number;
  }>({
    category: '',
    amount: '',
    shop: '',
    used_by: '',
    product_name: '',
    remark: '',
    used_at: '',
    display_order: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/expense/${id}`);
      if (res.ok) {
        const data: Expense = await res.json();
        setForm({
          category: data.category,
          amount: String(data.amount),
          shop: data.shop,
          used_by: data.used_by ?? '',
          product_name: data.product_name ?? '',
          remark: data.remark ?? '',
          used_at: data.used_at,
          display_order: data.display_order ?? 0,
        });
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/expense/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: form.category,
        amount: Number(form.amount),
        shop: form.shop,
        used_by: form.used_by,
        product_name: form.product_name,
        remark: form.remark,
        used_at: form.used_at,
        display_order: form.display_order,
      }),
    });
    if (res.ok) {
      router.push('/expenses');
    } else {
      alert('更新失敗');
    }
  };

  const handleDelete = async () => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/expense/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/expenses');
    } else {
      alert('削除失敗');
    }
  };

  if (loading) return <div className="page-wrap p-8 text-center text-slate-300 card-basic">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>✏️</span> 支出情報編集
          </h1>
          <p className="text-xs text-slate-300 mt-1">支出データの編集・削除を行います</p>
        </div>
        <Link href="/expenses" className="btn btn-secondary text-xs">
          ← 一覧に戻る
        </Link>
      </div>

      <form onSubmit={handleUpdate} className="card-form space-y-4 shadow-2xl border border-indigo-500/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">勘定科目 <span className="text-rose-400">*</span></label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="form-input" required />
          </div>
          <div>
            <label className="form-label">金額 (円) <span className="text-rose-400">*</span></label>
            <input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="form-input font-mono" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">利用店舗・場所 <span className="text-rose-400">*</span></label>
            <input value={form.shop} onChange={(e) => setForm({ ...form, shop: e.target.value })} className="form-input" required />
          </div>
          <div>
            <label className="form-label">利用日 <span className="text-rose-400">*</span></label>
            <input type="date" value={form.used_at} onChange={(e) => setForm({ ...form, used_at: e.target.value })} className="form-input font-mono" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">利用者</label>
            <input
              value={form.used_by ?? ''}
              onChange={(e) => setForm({ ...form, used_by: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">表示順</label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
              className="form-input font-mono"
            />
          </div>
        </div>

        <div>
          <label className="form-label">商品名・サービス詳細</label>
          <input
            value={form.product_name ?? ''}
            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">備考・メモ</label>
          <textarea
            value={form.remark ?? ''}
            onChange={(e) => setForm({ ...form, remark: e.target.value })}
            className="form-textarea min-h-24"
            rows={3}
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-700/80">
          <Link href="/expenses" className="btn btn-secondary text-xs px-3.5 py-1.5">
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

export default ExpenseEditPage;
