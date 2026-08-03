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
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 1,
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
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgb(5, 150, 105)',
        borderWidth: 1,
      },
    ],
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <div className="space-y-6 page-wrap">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">家計簿 集計・分析</h1>
        <Link href="/expenses" className="btn btn-secondary text-sm self-start sm:self-auto">
          ← 一覧に戻る
        </Link>
      </div>

      {/* タブ切り替え */}
      <div className="flex border-b border-gray-200/30">
        <button
          onClick={() => setActiveTab('category')}
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'category'
              ? 'border-blue-400 text-white font-bold'
              : 'border-transparent text-gray-300 hover:text-white'
          }`}
        >
          月別カテゴリ集計
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'monthly'
              ? 'border-blue-400 text-white font-bold'
              : 'border-transparent text-gray-300 hover:text-white'
          }`}
        >
          年間・月別推移
        </button>
      </div>

      {/* カテゴリ別集計タブ */}
      {activeTab === 'category' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-sm backdrop-blur-sm">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">対象月</label>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">利用者</label>
              <select
                value={user}
                onChange={e => setUser(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
            <div className="ml-auto text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">月間合計額</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                ¥{categoryTotalSum.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-800/95 p-4 rounded-lg shadow-sm backdrop-blur-sm">
            <Bar data={categoryChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-600">勘定科目</th>
                  <th className="py-3 px-4 text-right border-b border-gray-200 dark:border-gray-600">合計金額</th>
                  <th className="py-3 px-4 text-right border-b border-gray-200 dark:border-gray-600">構成比</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {categoryData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-500 dark:text-gray-400">
                      該当するデータがありません
                    </td>
                  </tr>
                ) : (
                  categoryData.map(d => {
                    const percentage = categoryTotalSum > 0 ? ((d.total / categoryTotalSum) * 100).toFixed(1) : '0';
                    return (
                      <tr key={d.category} className="hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <td className="py-3 px-4">{d.category}</td>
                        <td className="py-3 px-4 text-right font-medium">¥{d.total.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400">{percentage}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {categoryData.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-100 dark:bg-gray-700/80 font-bold text-gray-900 dark:text-white border-t-2 border-gray-300 dark:border-gray-500">
                    <td className="py-3 px-4">合計</td>
                    <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">¥{categoryTotalSum.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">100%</td>
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
          <div className="flex flex-wrap gap-4 items-center bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-sm backdrop-blur-sm">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">対象年</label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>
                    {y}年
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">利用者</label>
              <select
                value={user}
                onChange={e => setUser(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
            <div className="ml-auto flex gap-6 text-right">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">年間合計</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  ¥{monthlyTotalSum.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">月平均</div>
                <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  ¥{monthlyAverage.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-800/95 p-4 rounded-lg shadow-sm backdrop-blur-sm">
            <Bar data={monthlyChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-600">年月</th>
                  <th className="py-3 px-4 text-right border-b border-gray-200 dark:border-gray-600">件数</th>
                  <th className="py-3 px-4 text-right border-b border-gray-200 dark:border-gray-600">月間合計</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {monthlyData.map(d => {
                  const [y, m] = d.month.split('-');
                  return (
                    <tr key={d.month} className="hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <td className="py-3 px-4 font-medium">{y}年{m}月</td>
                      <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400">{d.count} 件</td>
                      <td className="py-3 px-4 text-right font-medium">¥{d.total.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 dark:bg-gray-700/80 font-bold text-gray-900 dark:text-white border-t-2 border-gray-300 dark:border-gray-500">
                  <td className="py-3 px-4">年間合計 ({monthlyTotalCount} 件)</td>
                  <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400">{monthlyTotalCount} 件</td>
                  <td className="py-3 px-4 text-right text-green-600 dark:text-green-400">¥{monthlyTotalSum.toLocaleString()}</td>
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
