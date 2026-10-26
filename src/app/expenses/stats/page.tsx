'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Summary = { category: string; total: number };
type MonthlySummary = { month: string; total: number; count: number };

const ExpenseStatsPage = () => {
  const [activeTab, setActiveTab] = useState<'category' | 'monthly'>('category');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const [user, setUser] = useState('共有');
  const [users, setUsers] = useState<string[]>([]);
  const [categoryData, setCategoryData] = useState<Summary[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([]);

  useEffect(() => {
    const now = new Date();
    const m = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(m);
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch('/api/expense/users');
        if (res.ok) {
          const u: string[] = await res.json();
          setUsers(u);
        }
      } catch (e) {
        console.error('Failed to load users:', e);
      }
    };
    loadUsers();
  }, []);

  // Fetch category data for selected month
  useEffect(() => {
    if (!month) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/expense/summary?month=${month}&used_by=${user}`);
        if (res.ok) {
          const d: Summary[] = await res.json();
          setCategoryData(d);
        }
      } catch (e) {
        console.error('Failed to load category summary:', e);
      }
    };
    load();
  }, [month, user]);

  // Fetch monthly trend data for selected year
  useEffect(() => {
    if (!year) return;
    const loadMonthly = async () => {
      try {
        const res = await fetch(`/api/expense/monthly?year=${year}&used_by=${user}`);
        if (res.ok) {
          const d: MonthlySummary[] = await res.json();
          setMonthlyData(d);
        }
      } catch (e) {
        console.error('Failed to load monthly expense summary:', e);
      }
    };
    loadMonthly();
  }, [year, user]);

  const categoryTotalSum = categoryData.reduce((sum, item) => sum + item.total, 0);

  const categoryChartData = {
    labels: categoryData.map(d => d.category),
    datasets: [
      {
        label: '金額',
        data: categoryData.map(d => d.total),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: '#818cf8',
        borderWidth: 1.5,
      },
    ],
  };

  const monthlyTotalSum = monthlyData.reduce((sum, item) => sum + item.total, 0);
  const monthlyTotalCount = monthlyData.reduce((sum, item) => sum + item.count, 0);
  const monthlyAverage = monthlyData.length > 0 ? Math.round(monthlyTotalSum / 12) : 0;

  const monthlyChartData = {
    labels: monthlyData.map(d => {
      const parts = d.month.split('-');
      return `${parseInt(parts[1], 10)}月`;
    }),
    datasets: [
      {
        label: '月別支出合計',
        data: monthlyData.map(d => d.total),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#34d399',
        borderWidth: 1.5,
      },
    ],
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <div className="space-y-6 page-wrap">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            📊 家計簿 集計・分析
          </h1>
          <p className="text-xs text-slate-300 mt-1">カテゴリ別月次集計および年間支出推移グラフ</p>
        </div>
        <Link href="/expenses" className="btn btn-secondary text-sm self-start sm:self-auto">
          ← 一覧に戻る
        </Link>
      </div>

      {/* タブ切り替え */}
      <div className="flex border-b border-slate-700/80 gap-2">
        <button
          onClick={() => setActiveTab('category')}
          className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'category'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📅 月別カテゴリ集計
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'monthly'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📈 年間・月別推移
        </button>
      </div>

      {/* カテゴリ別集計タブ */}
      {activeTab === 'category' && (
        <div className="space-y-6">
          <div className="card-basic p-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">対象月</label>
                <input
                  type="month"
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">利用者</label>
                <select
                  value={user}
                  onChange={e => setUser(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="共有">共有</option>
                  <option value="all">全員</option>
                  {users.map(u => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">月間合計額</div>
              <div className="text-2xl font-bold text-indigo-400 font-mono">
                ¥{categoryTotalSum.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="card-basic p-4">
            <Bar data={categoryChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>

          <div className="table-container">
            <table className="table-basic">
              <thead>
                <tr>
                  <th className="table-header">勘定科目</th>
                  <th className="table-header text-right">合計金額</th>
                  <th className="table-header text-right">構成比</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="table-cell text-center text-slate-400 py-6">
                      該当するデータがありません
                    </td>
                  </tr>
                ) : (
                  categoryData.map(d => {
                    const percentage = categoryTotalSum > 0 ? ((d.total / categoryTotalSum) * 100).toFixed(1) : '0';
                    return (
                      <tr key={d.category} className="table-row">
                        <td className="table-cell font-medium text-slate-200">{d.category}</td>
                        <td className="table-cell text-right font-mono font-bold text-slate-100">¥{d.total.toLocaleString()}</td>
                        <td className="table-cell text-right font-mono text-indigo-300">{percentage}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {categoryData.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-900/90 font-bold text-white border-t border-slate-700">
                    <td className="table-cell">合計</td>
                    <td className="table-cell text-right font-mono text-indigo-400">¥{categoryTotalSum.toLocaleString()}</td>
                    <td className="table-cell text-right font-mono">100%</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* 年間・月別推移タブ */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="card-basic p-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">対象年</label>
                <select
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>
                      {y}年
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">利用者</label>
                <select
                  value={user}
                  onChange={e => setUser(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="共有">共有</option>
                  <option value="all">全員</option>
                  {users.map(u => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <div className="text-xs text-slate-400 font-medium">年間合計</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  ¥{monthlyTotalSum.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">月平均</div>
                <div className="text-2xl font-bold text-slate-200 font-mono">
                  ¥{monthlyAverage.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="card-basic p-4">
            <Bar data={monthlyChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>

          <div className="table-container">
            <table className="table-basic">
              <thead>
                <tr>
                  <th className="table-header">年月</th>
                  <th className="table-header text-right">件数</th>
                  <th className="table-header text-right">月間合計</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map(d => {
                  const [y, m] = d.month.split('-');
                  return (
                    <tr key={d.month} className="table-row">
                      <td className="table-cell font-medium text-slate-200 font-mono">{y}年{m}月</td>
                      <td className="table-cell text-right font-mono text-slate-300">{d.count} 件</td>
                      <td className="table-cell text-right font-mono font-bold text-emerald-300">¥{d.total.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900/90 font-bold text-white border-t border-slate-700">
                  <td className="table-cell">年間合計 ({monthlyTotalCount} 件)</td>
                  <td className="table-cell text-right font-mono text-slate-300">{monthlyTotalCount} 件</td>
                  <td className="table-cell text-right font-mono text-emerald-400">¥{monthlyTotalSum.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseStatsPage;
