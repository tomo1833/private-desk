'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NewExpensePage = () => {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [shop, setShop] = useState('');
  const [usedAt, setUsedAt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, amount: Number(amount), shop, used_at: usedAt }),
    });
    if (res.ok) {
      router.push('/expenses');
    } else {
      alert('登録失敗');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">支出登録</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block">勘定科目</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block">金額</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block">お店</label>
          <input value={shop} onChange={(e) => setShop(e.target.value)} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block">使った日</label>
          <input type="date" value={usedAt} onChange={(e) => setUsedAt(e.target.value)} className="w-full border p-2 rounded" required />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">登録</button>
        </div>
      </form>
    </div>
  );
};

export default NewExpensePage;
