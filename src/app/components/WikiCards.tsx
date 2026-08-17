'use client';
import type { Wiki } from '@/types/wiki';
import { useRouter } from 'next/navigation';

type Props = {
  wikis: Wiki[];
  viewMode?: 'card' | 'table';
  onDelete?: (id: number) => void;
};

const WikiCards: React.FC<Props> = ({ wikis, viewMode = 'card', onDelete }) => {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/wiki/${id}`, { method: 'DELETE' });
    if (res.ok) {
      onDelete?.(id);
    } else {
      alert('削除失敗');
    }
  };

  if (viewMode === 'table') {
    return (
      <div className="table-container">
        <table className="table-basic">
          <thead>
            <tr>
              <th className="table-header w-1/3">タイトル</th>
              <th className="table-header">内容</th>
              <th className="table-header w-32">作成日時</th>
              <th className="table-header text-right w-44">操作</th>
            </tr>
          </thead>
          <tbody>
            {wikis.map((wiki) => (
              <tr key={wiki.id} className="table-row">
                <td className="table-cell font-semibold text-slate-100">
                  <button
                    onClick={() => router.push(`/wikis/${wiki.id}`)}
                    className="hover:underline text-left text-amber-400 hover:text-amber-300 font-medium"
                  >
                    📌 {wiki.title}
                  </button>
                </td>
                <td className="table-cell text-xs text-slate-300">
                  <p className="line-clamp-2">{wiki.content}</p>
                </td>
                <td className="table-cell text-xs font-mono text-slate-400">
                  {wiki.created_at ? new Date(wiki.created_at).toLocaleDateString('ja-JP') : '-'}
                </td>
                <td className="table-cell text-right space-x-2">
                  <button
                    onClick={() => router.push(`/wikis/${wiki.id}`)}
                    className="btn btn-secondary text-xs px-2.5 py-1"
                  >
                    詳細
                  </button>
                  <button
                    onClick={() => router.push(`/wikis/edit/${wiki.id}`)}
                    className="btn btn-success text-xs px-2.5 py-1"
                  >
                    編集
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => handleDelete(wiki.id)}
                      className="btn btn-danger text-xs px-2.5 py-1"
                    >
                      削除
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {wikis.map((wiki) => (
        <div
          key={wiki.id}
          className="sticky-note group cursor-pointer flex flex-col justify-between"
          onClick={() => router.push(`/wikis/${wiki.id}`)}
        >
          <div>
            <span className="sticky-note-title group-hover:text-amber-300 transition-colors line-clamp-2">
              {wiki.title}
            </span>
            {wiki.content && (
              <p className="text-xs text-slate-300 line-clamp-3 mt-2 leading-relaxed">
                {wiki.content}
              </p>
            )}
          </div>
          <div className="mt-4 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <span className="sticky-note-date font-mono text-slate-400">
              {wiki.created_at ? new Date(wiki.created_at).toLocaleDateString('ja-JP') : ''}
            </span>
            <span className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              開く →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WikiCards;
