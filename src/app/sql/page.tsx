'use client';
import { useState } from 'react';

const SqlConsolePage = () => {
  const [sql, setSql] = useState('');
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [tables, setTables] = useState<string[] | null>(null);

  const execute = async () => {
    setMessage(null);
    setRows(null);
    try {
      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Error');
        return;
      }
      if (data.rows) {
        setRows(data.rows);
      } else {
        setMessage(data.message || 'ok');
      }
  } catch (err) {
      console.error(err);
      setMessage('execution failed');
    }
  };

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/sql/tables');
      if (res.ok) {
        const data: string[] = await res.json();
        setTables(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 space-y-6 border border-white/40 shadow-lg">
      <div className="form-header">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">SQLコンソール</h1>
        <p className="form-subtitle">データベースに対してSQLクエリを実行します</p>
      </div>
      <div className="space-y-4 mb-6">
        <label className="block text-gray-800 font-semibold mb-2">SQLクエリ</label>
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          rows={6}
          className="form-textarea font-mono"
          placeholder="SQLを入力"
        />
      </div>
      <div className="btn-group mt-2">
        <button onClick={execute} className="btn btn-primary">
          実行
        </button>
        <button onClick={fetchTables} className="btn btn-secondary">
          テーブル一覧
        </button>
      </div>
      {message && <p className="form-help text-green-600">{message}</p>}
      {tables && (
        <div>
          <h2 className="font-semibold mt-4">テーブル</h2>
          <ul className="list-disc pl-5">
            {tables.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      {rows && rows.length > 0 && (
        <table className="table-auto border-collapse w-full mt-4">
          <thead>
            <tr>
              {Object.keys(rows[0]).map((k) => (
                <th key={k} className="border p-2 bg-gray-100">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((v, j) => (
                  <td key={j} className="border p-2 whitespace-pre-wrap">
                    {String(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {rows && rows.length === 0 && <p>結果なし</p>}
    </div>
  );
};

export default SqlConsolePage;
