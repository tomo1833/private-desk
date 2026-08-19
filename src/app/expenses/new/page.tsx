'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NewExpensePage = () => {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [shop, setShop] = useState('');
  const [usedBy, setUsedBy] = useState('');
  const [productName, setProductName] = useState('');
  const [remark, setRemark] = useState('');
  const [usedAt, setUsedAt] = useState(new Date().toISOString().split('T')[0]);
  const [displayOrder, setDisplayOrder] = useState(0);

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
        display_order: displayOrder,
      }),
    });
    if (res.ok) {
      router.push('/expenses');
    } else {
      alert('登録失敗');
    }
  };

  return (
    <div className="space-y-6 page-wrap max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>💸</span> 支出新規登録
          </h1>
          <p className="text-xs text-slate-300 mt-1">日々の家計支出データを登録します</p>
        </div>
        <Link href="/expenses" className="btn btn-secondary text-xs">
          ← 一覧に戻る
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card-form space-y-4 shadow-2xl border border-indigo-500/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">勘定科目 <span className="text-rose-400">*</span></label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="form-input" required placeholder="例: 食費, 日用品, 交通費" />
          </div>
          <div>
            <label className="form-label">金額 (円) <span className="text-rose-400">*</span></label>
            <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input font-mono" required placeholder="0" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">利用店舗・場所 <span className="text-rose-400">*</span></label>
            <input value={shop} onChange={(e) => setShop(e.target.value)} className="form-input" required placeholder="例: セブンイレブン, Amazon" />
          </div>
          <div>
            <label className="form-label">利用日 <span className="text-rose-400">*</span></label>
            <input type="date" value={usedAt} onChange={(e) => setUsedAt(e.target.value)} className="form-input font-mono" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">利用者</label>
            <input value={usedBy} onChange={(e) => setUsedBy(e.target.value)} className="form-input" placeholder="例: 自分, 家族" />
          </div>
          <div>
            <label className="form-label">表示順</label>
            <input
              type="number"
              min={0}
              step={1}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="form-input font-mono"
            />
          </div>
        </div>

        <div>
          <label className="form-label">商品名・サービス詳細</label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="form-input"
            placeholder="例: ランチ代, キーボード購入"
          />
        </div>

        <div>
          <label className="form-label">備考・メモ</label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="form-textarea min-h-24"
            rows={3}
            placeholder="その他のメモや経費区分の記録..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/80">
          <Link href="/expenses" className="btn btn-secondary text-xs px-3.5 py-1.5">
            キャンセル
          </Link>
          <button type="submit" className="btn btn-primary text-xs px-4 py-1.5">
            登録する
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewExpensePage;
