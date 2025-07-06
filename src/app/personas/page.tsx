'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Persona } from '@/types/persona';

const PersonaListPage = () => {
  const [personas, setPersonas] = useState<Persona[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/persona');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Persona[] = await res.json();
        setPersonas(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, []);

  if (error) return <div>読み込みエラー</div>;
  if (!personas) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">ペルソナ一覧</h1>
      <Link href="/personas/new" className="bg-blue-500 text-white px-4 py-2 rounded">新規作成</Link>
      <ul className="space-y-2">
        {personas.map((p) => (
          <li key={p.id} className="border p-2 rounded">
            <p className="font-semibold">{p.name}</p>
            {p.description && <p className="text-sm">{p.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonaListPage;
