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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {diaries.map((diary) => (
        <div
          key={diary.id}
          className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/40 shadow-lg transition-all duration-300 p-6 space-y-3"
        >
          <h3 className="font-bold mb-2 truncate text-gray-900 dark:text-white">{diary.title}</h3>
          <p className="line-clamp-3 text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">{diary.content}</p>
          <div className="flex justify-end space-x-2">
            <button onClick={() => router.push(`/diaries/${diary.id}`)} className="btn btn-primary">
              詳細
            </button>
            <button onClick={() => router.push(`/diaries/edit/${diary.id}`)} className="btn btn-success">
              編集
            </button>
            <button onClick={() => handleDelete(diary.id)} className="btn btn-danger">
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiaryCards;
