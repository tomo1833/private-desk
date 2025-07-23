'use client';
import { useEffect, useState } from 'react';
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

const ExpenseStatsPage = () => {
  const [month, setMonth] = useState('');
  const [user, setUser] = useState('共有');
  const [users, setUsers] = useState<string[]>([]);
  const [data, setData] = useState<Summary[]>([]);

  useEffect(() => {
    const now = new Date();
    const m = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(m);
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      const res = await fetch('/api/expense/users');
      if (res.ok) {
        const u: string[] = await res.json();
        setUsers(u);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (!month) return;
    const load = async () => {
      const res = await fetch(`/api/expense/summary?month=${month}&used_by=${user}`);
      if (res.ok) {
        const d: Summary[] = await res.json();
        setData(d);
      }
    };
    load();
  }, [month, user]);

  const chartData = {
    labels: data.map(d => d.category),
    datasets: [
      {
        label: '金額',
        data: data.map(d => d.total),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">月別勘定科目集計</h1>
      <div className="space-x-4">
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border p-2 rounded"
        />
        <select value={user} onChange={e => setUser(e.target.value)} className="border p-2 rounded">
          <option value="共有">共有</option>
          <option value="all">全員</option>
          {users.map(u => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      <Bar data={chartData} />
      <table className="w-full mt-4 bg-white">
        <thead>
          <tr>
            <th className="border px-2 py-1">勘定科目</th>
            <th className="border px-2 py-1">合計</th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => (
            <tr key={d.category}>
              <td className="border px-2 py-1">{d.category}</td>
              <td className="border px-2 py-1 text-right">¥{d.total.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseStatsPage;
