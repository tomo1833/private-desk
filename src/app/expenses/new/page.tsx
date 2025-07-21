'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NewExpensePage = () => {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [shop, setShop] = useState('');
  const [productName, setProductName] = useState('');
  const [remark, setRemark] = useState('');
  const [usedAt, setUsedAt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        amount: Number(amount),
        shop,
        used_at: usedAt,
        product_name: productName || null,
        remark: remark || null,
      }),
    });
    if (res.ok) {
      router.push('/expenses');
    } else {
      alert('登録失敗');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">支出登録</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block text-white">勘定科目</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border p-2 rounded bg-white" required />
        </div>
        <div>
          <label className="block text-white">金額</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border p-2 rounded bg-white" required />
        </div>
        <div>
          <label className="block text-white">お店</label>
          <input value={shop} onChange={(e) => setShop(e.target.value)} className="w-full border p-2 rounded bg-white" required />
        </div>
        <div>
          <label className="block text-white">商品名</label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full border p-2 rounded bg-white"
          />
        </div>
        <div>
          <label className="block text-white">備考</label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full border p-2 rounded bg-white"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-white">使った日</label>
          <input type="date" value={usedAt} onChange={(e) => setUsedAt(e.target.value)} className="w-full border p-2 rounded bg-white" required />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">登録</button>
        </div>
      </form>
    </div>
  );
};

export default NewExpensePage;
