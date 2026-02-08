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
          className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] p-4 sm:p-6 space-y-3"
        >
          <h3 className="font-bold mb-2 text-base sm:text-lg truncate text-gray-900 dark:text-white">{udemy.title}</h3>
          <p className="line-clamp-3 text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">{udemy.content}</p>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button 
              onClick={() => router.push(`/udemys/${udemy.id}`)} 
              className="btn btn-primary w-full sm:w-auto text-sm sm:text-base"
            >
              詳細
            </button>
            <button 
              onClick={() => router.push(`/udemys/edit/${udemy.id}`)} 
              className="btn btn-success w-full sm:w-auto text-sm sm:text-base"
            >
              編集
            </button>
            <button 
              onClick={() => handleDelete(udemy.id)} 
              className="btn btn-danger w-full sm:w-auto text-sm sm:text-base"
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
