'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Expense } from '@/types/expense';

const ExpenseEditPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const [form, setForm] = useState<{
    category: string;
    amount: string;
    shop: string;
    used_at: string;
  }>({ category: '', amount: '', shop: '', used_at: '' });
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">支出編集</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <div>
          <label className="block">勘定科目</label>
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block">金額</label>
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block">お店</label>
          <input value={form.shop} onChange={(e) => setForm({ ...form, shop: e.target.value })} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block">使った日</label>
          <input type="date" value={form.used_at} onChange={(e) => setForm({ ...form, used_at: e.target.value })} className="w-full border p-2 rounded" required />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">更新</button>
          <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">削除</button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseEditPage;
