'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NewExpensePage = () => {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [shop, setShop] = useState('');
  const [usedBy, setUsedBy] = useState('');
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
        used_by: usedBy || null,
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
    <div className="card-form">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">支出登録</h1>
        <p className="form-subtitle">新しい支出情報を登録します</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 mb-6">
          <label className="form-label">勘定科目</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="form-input" required />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">金額</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input" required />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">お店</label>
          <input value={shop} onChange={(e) => setShop(e.target.value)} className="form-input" required />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">利用者</label>
          <input value={usedBy} onChange={(e) => setUsedBy(e.target.value)} className="form-input" />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">商品名</label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">備考</label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="form-textarea min-h-24"
            rows={3}
          />
        </div>
        <div className="space-y-4 mb-6">
          <label className="form-label">使った日</label>
          <input type="date" value={usedAt} onChange={(e) => setUsedAt(e.target.value)} className="form-input" required />
        </div>
        <div className="btn-group-between pt-4 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/expenses')}
            className="btn btn-secondary"
          >
            キャンセル
          </button>
          <button type="submit" className="btn btn-primary">
            登録
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewExpensePage;
