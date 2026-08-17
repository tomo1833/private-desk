'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import type { Subscription } from '@/types/subscription';

export default function SubscriptionsListPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cycleFilter, setCycleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/subscriptions');
        if (!res.ok) throw new Error('データ読み込み失敗');
        const data: Subscription[] = await res.json();
        setSubscriptions(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, []);

  // 計算サマリー
  const summary = useMemo(() => {
    if (!subscriptions) return { monthlyTotal: 0, yearlyTotal: 0, activeCount: 0, renewingSoonCount: 0 };

    let monthlyTotal = 0;
    let activeCount = 0;
    let renewingSoonCount = 0;
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + 30); // 30日以内

    subscriptions.forEach((sub) => {
      if (sub.status === 'Active' || sub.status === 'Trial') {
        activeCount++;
        const price = Number(sub.price) || 0;
        if (sub.cycle === 'monthly') {
          monthlyTotal += price;
        } else if (sub.cycle === 'yearly') {
          monthlyTotal += price / 12;
        }
      }

      if (sub.next_billing && (sub.status === 'Active' || sub.status === 'Canceling')) {
        const billingDate = new Date(sub.next_billing);
        if (billingDate >= now && billingDate <= targetDate) {
          renewingSoonCount++;
        }
      }
    });

    const yearlyTotal = monthlyTotal * 12;

    return {
      monthlyTotal: Math.round(monthlyTotal),
      yearlyTotal: Math.round(yearlyTotal),
      activeCount,
      renewingSoonCount,
    };
  }, [subscriptions]);

  // フィルタリング処理
  const filteredSubscriptions = useMemo(() => {
    if (!subscriptions) return [];
    return subscriptions.filter((sub) => {
      // ステータスフィルター
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      // サイクルフィルター
      if (cycleFilter !== 'all' && sub.cycle !== cycleFilter) return false;
      // テキスト検索
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = sub.name.toLowerCase().includes(q);
        const memoMatch = sub.memo?.toLowerCase().includes(q) ?? false;
        const emailMatch = sub.account_email?.toLowerCase().includes(q) ?? false;
        const keyMatch = sub.license_key?.toLowerCase().includes(q) ?? false;
        return nameMatch || memoMatch || emailMatch || keyMatch;
      }
      return true;
    });
  }, [subscriptions, searchQuery, statusFilter, cycleFilter]);

  const handleCopyKey = (key: string, id: number) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            🟢 契約中
          </span>
        );
      case 'Canceling':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ⚠️ 解約予定
          </span>
        );
      case 'Canceled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
            ⚪ 解約済
          </span>
        );
      case 'Trial':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            🟣 お試し・検討中
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300">
            {status}
          </span>
        );
    }
  };

  const getCycleLabel = (cycle: string) => {
    switch (cycle) {
      case 'monthly':
        return '月額';
      case 'yearly':
        return '年額';
      case 'one_time':
        return '買い切り (一括)';
      case 'free':
        return '無料';
      default:
        return cycle;
    }
  };

  if (error) return <div className="text-red-400 text-center p-4">エラー: {error}</div>;
  if (!subscriptions) return <div className="text-center text-white p-4">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            💻 ソフトウェア・サブスク管理
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            利用中のアプリ・サブスクリプションの費用試算と契約状況が一目でわかります
          </p>
        </div>
        <Link href="/subscriptions/new" className="btn btn-primary text-center self-start sm:self-auto">
          ➕ 新規登録
        </Link>
      </div>

      {/* サマリーKPIカード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-basic bg-gradient-to-br from-blue-900/40 to-slate-800/60 border border-blue-500/30 p-4 rounded-xl shadow-lg">
          <div className="text-xs font-medium text-blue-200 uppercase tracking-wider">推定月額コスト</div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
            ¥{summary.monthlyTotal.toLocaleString()}
            <span className="text-xs font-normal text-gray-300 ml-1">/月</span>
          </div>
          <p className="text-xs text-blue-300/80 mt-1">月額費 ＋ 年額費換算(/12)</p>
        </div>

        <div className="card-basic bg-gradient-to-br from-purple-900/40 to-slate-800/60 border border-purple-500/30 p-4 rounded-xl shadow-lg">
          <div className="text-xs font-medium text-purple-200 uppercase tracking-wider">推定年間コスト</div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
            ¥{summary.yearlyTotal.toLocaleString()}
            <span className="text-xs font-normal text-gray-300 ml-1">/年</span>
          </div>
          <p className="text-xs text-purple-300/80 mt-1">年間支出の見込み合計</p>
        </div>

        <div className="card-basic bg-gradient-to-br from-emerald-900/40 to-slate-800/60 border border-emerald-500/30 p-4 rounded-xl shadow-lg">
          <div className="text-xs font-medium text-emerald-200 uppercase tracking-wider">契約中のサービス</div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
            {summary.activeCount}
            <span className="text-xs font-normal text-gray-300 ml-1">件</span>
          </div>
          <p className="text-xs text-emerald-300/80 mt-1">アクティブな利用件数</p>
        </div>

        <div className="card-basic bg-gradient-to-br from-amber-900/40 to-slate-800/60 border border-amber-500/30 p-4 rounded-xl shadow-lg">
          <div className="text-xs font-medium text-amber-200 uppercase tracking-wider">30日以内の更新予定</div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
            {summary.renewingSoonCount}
            <span className="text-xs font-normal text-gray-300 ml-1">件</span>
          </div>
          <p className="text-xs text-amber-300/80 mt-1">更新・支払い期日間近</p>
        </div>
      </div>

      {/* 検索・フィルター・表示切替バー */}
      <div className="card-basic p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* キーワード検索 */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="サービス名、メール、メモ、ライセンスキーで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/80 border border-gray-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white text-xs"
              >
                ✕ クリア
              </button>
            )}
          </div>

          {/* フィルター・切り替えコントロール */}
          <div className="flex flex-wrap items-center gap-2">
            {/* ステータス */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800/80 border border-gray-700 text-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">全ステータス</option>
              <option value="Active">契約中</option>
              <option value="Canceling">解約予定</option>
              <option value="Canceled">解約済</option>
              <option value="Trial">お試し・検討中</option>
            </select>

            {/* 周期 */}
            <select
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800/80 border border-gray-700 text-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">全タイプ</option>
              <option value="monthly">月額</option>
              <option value="yearly">年額</option>
              <option value="one_time">買い切り</option>
              <option value="free">無料</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg bg-gray-800/80 border border-gray-700 p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  viewMode === 'card'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🎴 カード
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📋 テーブル
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ表示 */}
      {filteredSubscriptions.length === 0 ? (
        <div className="card-basic text-center py-12 text-gray-400 space-y-3">
          <p className="text-lg font-medium">条件に一致するサブスク・ソフトウェアが見つかりませんでした</p>
          <Link href="/subscriptions/new" className="btn btn-primary inline-block text-sm">
            新しいサービスを登録する
          </Link>
        </div>
      ) : viewMode === 'card' ? (
        /* カード一覧ビュー */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map((sub) => (
            <div
              key={sub.id}
              className="card-basic flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all duration-200"
            >
              <div className="space-y-3">
                {/* ヘッダー: 名前とステータス */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                      {sub.name}
                    </h2>
                    <span className="inline-block mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {getCycleLabel(sub.cycle)}
                    </span>
                  </div>
                  {getStatusBadge(sub.status)}
                </div>

                {/* 価格情報 */}
                <div className="bg-gray-100 dark:bg-gray-800/60 p-3 rounded-lg flex justify-between items-baseline">
                  <span className="text-xs text-gray-600 dark:text-gray-400">料金</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ¥{Number(sub.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      {sub.cycle === 'monthly' ? '/月' : sub.cycle === 'yearly' ? '/年' : ''}
                    </span>
                  </div>
                </div>

                {/* 詳細属性 */}
                <div className="space-y-2 text-xs">
                  {sub.next_billing && (
                    <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                      <span>次回更新日:</span>
                      <span className="font-mono font-medium text-amber-500 dark:text-amber-400">
                        {sub.next_billing}
                      </span>
                    </div>
                  )}

                  {sub.account_email && (
                    <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                      <span>登録アカウント:</span>
                      <span className="font-mono truncate max-w-[180px]">{sub.account_email}</span>
                    </div>
                  )}

                  {sub.license_key && (
                    <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                      <span>ライセンスキー:</span>
                      <button
                        onClick={() => handleCopyKey(sub.license_key!, sub.id)}
                        className="text-blue-500 hover:text-blue-400 font-mono text-xs flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
                      >
                        {copiedId === sub.id ? '✓ コピー完了' : '📋 キーをコピー'}
                      </button>
                    </div>
                  )}

                  {sub.url && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">公式サイト:</span>
                      <a
                        href={sub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline truncate max-w-[180px]"
                      >
                        {sub.url}
                      </a>
                    </div>
                  )}

                  {sub.memo && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700/60">
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{sub.memo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* フッターアクション */}
              <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700/60 text-xs">
                <Link
                  href={`/subscriptions/${sub.id}`}
                  className="text-gray-600 dark:text-gray-400 hover:text-white"
                >
                  詳細を見る
                </Link>
                <Link
                  href={`/subscriptions/edit/${sub.id}`}
                  className="text-blue-500 hover:text-blue-400 font-medium"
                >
                  編集
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* テーブル一覧ビュー */
        <div className="table-container">
          <table className="table-basic">
            <thead>
              <tr>
                <th className="table-header">サービス名</th>
                <th className="table-header">ステータス</th>
                <th className="table-header">料金 / 周期</th>
                <th className="table-header">次回更新日</th>
                <th className="table-header">アカウント</th>
                <th className="table-header text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="table-row">
                  <td className="table-cell font-semibold text-slate-100">
                    <Link href={`/subscriptions/${sub.id}`} className="hover:underline text-indigo-400 hover:text-indigo-300">
                      {sub.name}
                    </Link>
                  </td>
                  <td className="table-cell">{getStatusBadge(sub.status)}</td>
                  <td className="table-cell font-mono font-medium text-slate-100">
                    ¥{Number(sub.price).toLocaleString()}
                    <span className="text-xs text-slate-300 ml-1">({getCycleLabel(sub.cycle)})</span>
                  </td>
                  <td className="table-cell font-mono text-xs text-indigo-300">{sub.next_billing || '-'}</td>
                  <td className="table-cell text-xs font-mono text-slate-300">{sub.account_email || '-'}</td>
                  <td className="table-cell text-right space-x-3 text-xs">
                    <Link
                      href={`/subscriptions/${sub.id}`}
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      詳細
                    </Link>
                    <Link
                      href={`/subscriptions/edit/${sub.id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
