'use client';
import { useState } from 'react';

const SqlConsolePage = () => {
  const [sql, setSql] = useState('');
  const [rows, setRows] = useState<any[] | null>(null);
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">SQLコンソール</h1>
      <textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        rows={6}
        className="w-full p-2 border rounded"
        placeholder="SQLを入力"
      />
      <div className="flex gap-2">
        <button onClick={execute} className="btn btn-primary">
          実行
        </button>
        <button onClick={fetchTables} className="btn btn-secondary">
          テーブル一覧
        </button>
      </div>
      {message && <p>{message}</p>}
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
