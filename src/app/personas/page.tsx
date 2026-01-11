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

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/persona/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPersonas(personas!.filter((p) => p.id !== id));
    } else {
      alert('削除失敗');
    }
  };

  if (error) return <div>読み込みエラー</div>;
  if (!personas) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4 w-full px-2 sm:px-6 lg:px-8">
      <h1 className="form-title  text-white">ペルソナ一覧</h1>
      <div className="flex justify-end my-4">
        <Link href="/personas/new" className="btn btn-primary">新規作成</Link>
      </div>
      <ul className="space-y-2">
        {personas.map((p) => (
          <li key={p.id} className="border p-2 rounded space-y-1">
            <p className="font-semibold">{p.name}</p>
            {p.description && <p className="text-sm">{p.description}</p>}
            <div className="flex justify-end space-x-2">
              <Link href={`/personas/edit/${p.id}`} className="btn btn-success">
                編集
              </Link>
              <button onClick={() => handleDelete(p.id)} className="btn btn-danger">
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonaListPage;
