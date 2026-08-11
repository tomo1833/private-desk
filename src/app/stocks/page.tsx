'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Stock } from '@/types/stock';

interface FormState {
  code: string;
  name: string;
  market: string;
  shares: number | string;
  acquisition_price: number | string;
  current_price: number | string;
  dividend_per_share: number | string;
  memo: string;
  display_order: number | string;
}

const initialForm: FormState = {
  code: '',
  name: '',
  market: 'プライム',
  shares: 100,
  acquisition_price: '',
  current_price: '',
  dividend_per_share: '',
  memo: '',
  display_order: 0,
};

const MARKET_OPTIONS = ['プライム', 'スタンダード', 'グロース', 'ETF', 'REIT', 'その他'];

export default function StockPortfolioPage() {
  const [stocks, setStocks] = useState<Stock[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'profit' | 'evalValue' | 'code'>('evalValue');

  // モーダル状態
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);

  const fetchStocks = async () => {
    try {
      const res = await fetch('/api/stocks');
      if (!res.ok) throw new Error('銘柄一覧の取得に失敗しました');
      const data: Stock[] = await res.json();
      setStocks(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // 資産計算サマリー
  const summary = useMemo(() => {
    if (!stocks || stocks.length === 0) {
      return {
        totalCost: 0,
        totalEval: 0,
        totalProfit: 0,
        profitRate: 0,
        totalDividend: 0,
        dividendYield: 0,
      };
    }

    let totalCost = 0;
    let totalEval = 0;
    let totalDividend = 0;

    stocks.forEach((s) => {
      const cost = (s.shares || 0) * (s.acquisition_price || 0);
      const evalVal = (s.shares || 0) * (s.current_price || 0);
      const div = (s.shares || 0) * (s.dividend_per_share || 0);

      totalCost += cost;
      totalEval += evalVal;
      totalDividend += div;
    });

    const totalProfit = totalEval - totalCost;
    const profitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const dividendYield = totalCost > 0 ? (totalDividend / totalCost) * 100 : 0;

    return {
      totalCost,
      totalEval,
      totalProfit,
      profitRate,
      totalDividend,
      dividendYield,
    };
  }, [stocks]);

  // フィルタリング・ソート済み銘柄リスト
  const filteredStocks = useMemo(() => {
    if (!stocks) return [];

    let list = stocks.filter((s) => {
      const query = searchQuery.toLowerCase();
      return (
        s.code.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query) ||
        s.market.toLowerCase().includes(query)
      );
    });

    list.sort((a, b) => {
      if (sortBy === 'profit') {
        const profitA = (a.shares || 0) * ((a.current_price || 0) - (a.acquisition_price || 0));
        const profitB = (b.shares || 0) * ((b.current_price || 0) - (b.acquisition_price || 0));
        return profitB - profitA;
      }
      if (sortBy === 'evalValue') {
        const evalA = (a.shares || 0) * (a.current_price || 0);
        const evalB = (b.shares || 0) * (b.current_price || 0);
        return evalB - evalA;
      }
      return a.code.localeCompare(b.code);
    });

    return list;
  }, [stocks, searchQuery, sortBy]);

  const handleOpenNew = () => {
    setForm(initialForm);
    setEditId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (stock: Stock) => {
    setForm({
      code: stock.code,
      name: stock.name,
      market: stock.market,
      shares: stock.shares,
      acquisition_price: stock.acquisition_price,
      current_price: stock.current_price,
      dividend_per_share: stock.dividend_per_share,
      memo: stock.memo || '',
      display_order: stock.display_order,
    });
    setEditId(stock.id);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/stocks/${editId}` : '/api/stocks';
    const method = editId ? 'PUT' : 'POST';

    const payload = {
      ...form,
      shares: Number(form.shares) || 0,
      acquisition_price: Number(form.acquisition_price) || 0,
      current_price: Number(form.current_price) || 0,
      dividend_per_share: Number(form.dividend_per_share) || 0,
      display_order: Number(form.display_order) || 0,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('保存に失敗しました');
      setIsOpen(false);
      fetchStocks();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (editId === null) return;
    if (!confirm('この銘柄を削除してもよろしいですか？')) return;
    try {
      const res = await fetch(`/api/stocks/${editId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('削除に失敗しました');
      setIsOpen(false);
      fetchStocks();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (error) return <div className="text-red-500 text-center p-4">エラー: {error}</div>;
  if (!stocks) return <div className="text-center p-4">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ヘッダータイトル ＆ 操作ボタン */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            📈 日本株ポートフォリオ
          </h1>
          <p className="text-xs text-gray-200 mt-1">保有株式の評価額・損益・予想配当金を一括管理</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="btn btn-primary text-center self-start sm:self-auto flex items-center gap-1.5 shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          銘柄を追加
        </button>
      </div>

      {/* サマリーダッシュボード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="card-basic p-4 space-y-1 border-l-4 border-indigo-500">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">評価額合計</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            ¥{summary.totalEval.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            取得額: ¥{summary.totalCost.toLocaleString()}
          </div>
        </div>

        <div className={`card-basic p-4 space-y-1 border-l-4 ${summary.totalProfit >= 0 ? 'border-emerald-500' : 'border-rose-500'}`}>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">評価損益</div>
          <div className={`text-lg sm:text-2xl font-bold ${summary.totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {summary.totalProfit >= 0 ? '+' : ''}¥{summary.totalProfit.toLocaleString()}
          </div>
          <div className={`text-[11px] font-semibold ${summary.totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {summary.totalProfit >= 0 ? '+' : ''}{summary.profitRate.toFixed(2)}%
          </div>
        </div>

        <div className="card-basic p-4 space-y-1 border-l-4 border-amber-500">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">年間予想配当金</div>
          <div className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            ¥{summary.totalDividend.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            配当利回り: {summary.dividendYield.toFixed(2)}%
          </div>
        </div>

        <div className="card-basic p-4 space-y-1 border-l-4 border-blue-500">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">銘柄数</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            {stocks.length} <span className="text-xs font-normal">銘柄</span>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            保有株合計: {stocks.reduce((acc, cur) => acc + (cur.shares || 0), 0).toLocaleString()} 株
          </div>
        </div>
      </div>

      {/* 検索 ＆ ソート バー */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-900/20 backdrop-blur-md p-3 rounded-xl border border-white/10">
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="銘柄名 / コードで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 text-white placeholder-gray-300 border border-white/20 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-white self-end sm:self-auto">
          <span>並び順:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-2.5 py-1 text-xs outline-none"
          >
            <option value="evalValue">評価額が大きい順</option>
            <option value="profit">評価益が大きい順</option>
            <option value="code">銘柄コード順</option>
          </select>
        </div>
      </div>

      {/* 銘柄一覧テーブル / カード */}
      {filteredStocks.length > 0 ? (
        <div className="card-basic p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3">コード / 銘柄名</th>
                  <th className="px-4 py-3">市場</th>
                  <th className="px-4 py-3 text-right">保有数</th>
                  <th className="px-4 py-3 text-right">取得単価</th>
                  <th className="px-4 py-3 text-right">現在株価</th>
                  <th className="px-4 py-3 text-right">評価額</th>
                  <th className="px-4 py-3 text-right">評価損益</th>
                  <th className="px-4 py-3 text-right">予想配当金</th>
                  <th className="px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredStocks.map((stock) => {
                  const cost = stock.shares * stock.acquisition_price;
                  const evalVal = stock.shares * stock.current_price;
                  const profit = evalVal - cost;
                  const profitRate = cost > 0 ? (profit / cost) * 100 : 0;
                  const annualDiv = stock.shares * stock.dividend_per_share;

                  return (
                    <tr
                      key={stock.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
                            {stock.code}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">{stock.name}</span>
                        </div>
                        {stock.memo && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                            {stock.memo}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {stock.market}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {stock.shares.toLocaleString()} <span className="text-[10px] text-gray-400">株</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        ¥{stock.acquisition_price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold">
                        ¥{stock.current_price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        ¥{evalVal.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-xs font-bold ${profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        <div>{profit >= 0 ? '+' : ''}¥{profit.toLocaleString()}</div>
                        <div className="text-[10px] font-normal">({profit >= 0 ? '+' : ''}{profitRate.toFixed(2)}%)</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-amber-600 dark:text-amber-400">
                        ¥{annualDiv.toLocaleString()}
                        <div className="text-[10px] text-gray-400">({stock.dividend_per_share}円/株)</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(stock)}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            編集
                          </button>
                          <a
                            href={`https://finance.yahoo.co.jp/quote/${stock.code}.T`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                            title="Yahoo!ファイナンスでチャート表示"
                          >
                            Yahoo!
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card-basic text-center text-gray-500 dark:text-gray-400 py-12">
          <p className="text-lg mb-4">登録されている日本株がありません</p>
          <button onClick={handleOpenNew} className="btn btn-primary inline-block">
            最初の銘柄を追加
          </button>
        </div>
      )}

      {/* 登録・編集モーダル */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
              {editId ? '銘柄情報変更' : '新規銘柄追加'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="stock-code" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    銘柄コード <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="stock-code"
                    type="text"
                    placeholder="例: 7203"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="stock-market" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    市場区分
                  </label>
                  <select
                    id="stock-market"
                    value={form.market}
                    onChange={(e) => setForm({ ...form, market: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
                  >
                    {MARKET_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="stock-name" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  銘柄名 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="stock-name"
                  type="text"
                  placeholder="例: トヨタ自動車"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="stock-shares" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    保有株数 (株)
                  </label>
                  <input
                    id="stock-shares"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="100"
                    value={form.shares}
                    onChange={(e) => setForm({ ...form, shares: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="stock-acq-price" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    平均取得単価 (円)
                  </label>
                  <input
                    id="stock-acq-price"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="2500"
                    value={form.acquisition_price}
                    onChange={(e) => setForm({ ...form, acquisition_price: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="stock-cur-price" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    現在株価 (円)
                  </label>
                  <input
                    id="stock-cur-price"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="2700"
                    value={form.current_price}
                    onChange={(e) => setForm({ ...form, current_price: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="stock-div" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    予想1株配当金 (円/年)
                  </label>
                  <input
                    id="stock-div"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="90"
                    value={form.dividend_per_share}
                    onChange={(e) => setForm({ ...form, dividend_per_share: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stock-memo" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  メモ (購入理由や戦略など)
                </label>
                <textarea
                  id="stock-memo"
                  rows={2}
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
                  >
                    削除
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
                >
                  {editId ? '更新' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
