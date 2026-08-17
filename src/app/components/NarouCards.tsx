'use client';
import type { Narou } from '@/types/narou';
import { useRouter } from 'next/navigation';

type Props = { narous: Narou[]; onDelete?: (id: number) => void };

const NarouCards: React.FC<Props> = ({ narous, onDelete }) => {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/narou/${id}`, { method: 'DELETE' });
    if (res.ok) {
      onDelete?.(id);
    } else {
      alert('削除失敗');
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {narous.map((narou) => (
        <div
          key={narou.id}
          className="card-basic group flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-purple-500/40 hover:-translate-y-1 space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">
                📖
              </span>
              <h3 className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-purple-300 transition-colors truncate flex-1">
                {narou.title}
              </h3>
            </div>
            <p className="line-clamp-3 text-xs sm:text-sm whitespace-pre-wrap text-slate-200 leading-relaxed">
              {narou.content}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/80">
            <button 
              onClick={() => router.push(`/narous/${narou.id}`)} 
              className="btn btn-secondary text-xs px-3 py-1.5"
            >
              詳細
            </button>
            <button 
              onClick={() => router.push(`/narous/edit/${narou.id}`)} 
              className="btn btn-success text-xs px-3 py-1.5"
            >
              編集
            </button>
            <button 
              onClick={() => handleDelete(narou.id)} 
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

export default NarouCards;
