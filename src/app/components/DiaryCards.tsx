'use client';
import type { Diary } from '@/types/diary';
import { useRouter } from 'next/navigation';

type Props = { diaries: Diary[]; onDelete?: (id: number) => void };

const DiaryCards: React.FC<Props> = ({ diaries, onDelete }) => {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {diaries.map((diary) => (
        <div
          key={diary.id}
          className="card-basic group flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/40 hover:-translate-y-1 space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 text-xs font-mono rounded-md bg-slate-800/80 text-indigo-300 border border-slate-700/60">
                {diary.created_at ? new Date(diary.created_at).toLocaleDateString('ja-JP') : ''}
              </span>
            </div>
            <h3 className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
              {diary.title}
            </h3>
            <p className="line-clamp-3 text-xs sm:text-sm whitespace-pre-wrap text-slate-200 leading-relaxed">
              {diary.content}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/80">
            <button 
              onClick={() => router.push(`/diaries/${diary.id}`)} 
              className="btn btn-secondary text-xs px-3 py-1.5"
            >
              詳細
            </button>
            <button 
              onClick={() => router.push(`/diaries/edit/${diary.id}`)} 
              className="btn btn-success text-xs px-3 py-1.5"
            >
              編集
            </button>
            <button 
              onClick={() => handleDelete(diary.id)} 
              className="btn btn-danger text-xs px-3 py-1.5"
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiaryCards;
