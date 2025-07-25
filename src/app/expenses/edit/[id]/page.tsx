'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  }>({ category: '', amount: '', shop: '', used_by: '', product_name: '', remark: '', used_at: '' });
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

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 space-y-6 border border-white/40 shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">支出編集</h1>
        <p className="form-subtitle">支出情報の編集・更新を行います</p>
      </div>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">勘定科目</label>
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400" required />
        </div>
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">金額</label>
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400" required />
        </div>
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">お店</label>
          <input value={form.shop} onChange={(e) => setForm({ ...form, shop: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400" required />
        </div>
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">利用者</label>
          <input
            value={form.used_by ?? ''}
            onChange={(e) => setForm({ ...form, used_by: e.target.value })}
            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">商品名</label>
          <input
            value={form.product_name ?? ''}
            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">備考</label>
          <textarea
            value={form.remark ?? ''}
            onChange={(e) => setForm({ ...form, remark: e.target.value })}
            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 min-h-24 resize-vertical"
            rows={3}
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="block text-gray-800 font-semibold mb-2">使った日</label>
          <input type="date" value={form.used_at} onChange={(e) => setForm({ ...form, used_at: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400" required />
        </div>
        <div className="btn-group-between pt-4 mt-6 border-t border-gray-200">
          <div className="flex justify-start gap-3">
            <button
              type="button"
              onClick={() => router.push('/expenses')}
              className="btn btn-secondary"
            >
              キャンセル
            </button>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button type="submit" className="btn btn-primary">更新</button>
            <button type="button" onClick={handleDelete} className="btn btn-danger">削除</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExpenseEditPage;
