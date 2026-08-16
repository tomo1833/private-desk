'use client';
import type { Udemy } from '@/types/udemy';
import { useRouter } from 'next/navigation';

type Props = { udemys: Udemy[]; onDelete?: (id: number) => void };

const UdemyCards: React.FC<Props> = ({ udemys, onDelete }) => {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/udemy/${id}`, { method: 'DELETE' });
    if (res.ok) {
      onDelete?.(id);
    } else {
      alert('削除失敗');
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {udemys.map((udemy) => (
        <div
          key={udemy.id}
          className="card-basic group flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-cyan-500/40 hover:-translate-y-1 space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                🎓
              </span>
              <h3 className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-cyan-300 transition-colors truncate flex-1">
                {udemy.title}
              </h3>
            </div>
            <p className="line-clamp-3 text-xs sm:text-sm whitespace-pre-wrap text-slate-300 leading-relaxed">
              {udemy.content}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
            <button 
              onClick={() => router.push(`/udemys/${udemy.id}`)} 
              className="btn btn-secondary text-xs px-3 py-1.5"
            >
              詳細
            </button>
            <button 
              onClick={() => router.push(`/udemys/edit/${udemy.id}`)} 
              className="btn btn-success text-xs px-3 py-1.5"
            >
              編集
            </button>
            <button 
              onClick={() => handleDelete(udemy.id)} 
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

export default UdemyCards;
