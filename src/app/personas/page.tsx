'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import type { Persona } from '@/types/persona';
import ListControls from '@/app/components/ListControls';

const PersonaListPage = () => {
  const [personas, setPersonas] = useState<Persona[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

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

  const filteredAndSortedPersonas = useMemo(() => {
    if (!personas) return [];
    let list = [...personas];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ja');
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'oldest') return a.id - b.id;
      return 0;
    });

    return list;
  }, [personas, searchQuery, sortBy]);

  if (error) return <div className="text-rose-400 text-center p-6 card-basic">読み込みエラー: {error}</div>;
  if (!personas) return <div className="text-center text-slate-300 p-8">読み込み中...</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            🎭 ペルソナ一覧
          </h1>
          <p className="text-xs text-slate-300 mt-1">ブログ執筆・キャラクター設定ペルソナ管理</p>
        </div>
        <Link href="/personas/new" className="btn btn-primary text-center self-start sm:self-auto">
          ➕ 新規登録
        </Link>
      </div>

      {/* コントロール */}
      <ListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="ペルソナ名や詳細で検索..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={[
          { value: 'name', label: '名前順' },
          { value: 'newest', label: '新しい順' },
          { value: 'oldest', label: '古い順' },
        ]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={personas.length}
        filteredCount={filteredAndSortedPersonas.length}
      />

      {/* コンテンツ */}
      {filteredAndSortedPersonas.length === 0 ? (
        <div className="card-basic text-center py-12 text-slate-400">
          該当するペルソナが見つかりませんでした
        </div>
      ) : viewMode === 'table' ? (
        <div className="table-container">
          <table className="table-basic">
            <thead>
              <tr>
                <th className="table-header w-1/4">ペルソナ名</th>
                <th className="table-header">概要・説明</th>
                <th className="table-header text-right w-40">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPersonas.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell font-semibold text-slate-100">🎭 {p.name}</td>
                  <td className="table-cell text-xs text-slate-300">
                    <p className="line-clamp-2">{p.description || '-'}</p>
                  </td>
                  <td className="table-cell text-right space-x-2">
                    <Link href={`/personas/edit/${p.id}`} className="btn btn-sm btn-success">
                      編集
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-danger">
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPersonas.map((p) => (
            <div key={p.id} className="card-basic flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <p className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <span>🎭</span> {p.name}
                </p>
                {p.description && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-4">
                    {p.description}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700/80">
                <Link href={`/personas/edit/${p.id}`} className="btn btn-sm btn-success">
                  編集
                </Link>
                <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-danger">
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonaListPage;
