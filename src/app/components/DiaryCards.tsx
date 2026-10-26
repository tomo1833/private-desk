'use client';
import type { Diary } from '@/types/diary';
import { useRouter } from 'next/navigation';

const toExcerpt = (content: string) =>
  content
    .slice(0, 400)
    .replace(/```[\s\S]*?(```|$)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[#>\-*\s]+/gm, '')
    .replace(/[*_`~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

type Props = {
  diaries: Diary[];
  viewMode?: 'card' | 'table';
  onDelete?: (id: number) => void;
};

const DiaryCards: React.FC<Props> = ({ diaries, viewMode = 'card', onDelete }) => {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/diary/${id}`, { method: 'DELETE' });
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
              <th className="table-header w-28">日付</th>
              <th className="table-header w-1/3">タイトル</th>
              <th className="table-header">内容</th>
              <th className="table-header text-right w-52">操作</th>
            </tr>
          </thead>
          <tbody>
            {diaries.map((diary) => (
              <tr key={diary.id} className="table-row">
                <td className="table-cell font-mono text-xs text-indigo-300">
                  {diary.date
                    ? new Date(diary.date).toLocaleDateString('ja-JP')
                    : diary.created_at
                    ? new Date(diary.created_at).toLocaleDateString('ja-JP')
                    : '-'}
                </td>
                <td className="table-cell font-semibold text-slate-100">
                  <button
                    onClick={() => router.push(`/diaries/${diary.id}`)}
                    className="hover:underline text-left text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    📝 {diary.title}
                  </button>
                </td>
                <td className="table-cell text-xs text-slate-300">
                  <p className="line-clamp-2">{diary.content}</p>
                </td>
                <td className="table-cell text-right space-x-2">
                  <button
                    onClick={() => router.push(`/diaries/new?copyFrom=${diary.id}`)}
                    className="btn btn-secondary text-xs px-2 py-1"
                    title="コピー作成"
                  >
                    📋 コピー
                  </button>
                  <button
                    onClick={() => router.push(`/diaries/${diary.id}`)}
                    className="btn btn-secondary text-xs px-2.5 py-1"
                  >
                    詳細
                  </button>
                  <button
                    onClick={() => router.push(`/diaries/edit/${diary.id}`)}
                    className="btn btn-success text-xs px-2.5 py-1"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(diary.id)}
                    className="btn btn-danger text-xs px-2.5 py-1"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
      {diaries.map((diary) => (
        <div
          key={diary.id}
          className="card-basic group flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/40 hover:-translate-y-1 space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 text-xs font-mono rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                📅 {diary.date
                  ? new Date(diary.date).toLocaleDateString('ja-JP')
                  : diary.created_at
                  ? new Date(diary.created_at).toLocaleDateString('ja-JP')
                  : ''}
              </span>
            </div>
            <h3
              onClick={() => router.push(`/diaries/${diary.id}`)}
              className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-indigo-300 transition-colors cursor-pointer line-clamp-1"
            >
              {diary.title}
            </h3>
            <p className="line-clamp-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {toExcerpt(diary.content)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-700/80 text-xs">
            <button
              onClick={() => router.push(`/diaries/new?copyFrom=${diary.id}`)}
              className="whitespace-nowrap text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-medium"
              title="この日報をコピーして新規作成"
            >
              📋 コピー
            </button>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <button 
                onClick={() => router.push(`/diaries/${diary.id}`)} 
                className="btn btn-primary text-xs px-3 py-1 whitespace-nowrap"
              >
                詳細
              </button>
              <button 
                onClick={() => router.push(`/diaries/edit/${diary.id}`)} 
                className="btn btn-secondary text-xs px-2.5 py-1 whitespace-nowrap"
              >
                編集
              </button>
              <button 
                onClick={() => handleDelete(diary.id)} 
                className="rounded-lg px-2 py-1 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10 hover:underline whitespace-nowrap"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiaryCards;
