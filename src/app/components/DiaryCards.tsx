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
          className="border border-gray-200 rounded p-4 bg-blue-50 dark:bg-gray-800 shadow-lg space-y-2"
        >
          <h3 className="font-bold mb-2 truncate">{diary.title}</h3>
          <p className="line-clamp-3 text-sm whitespace-pre-wrap">{diary.content}</p>
          <div className="flex justify-end space-x-2">
            <button onClick={() => router.push(`/diaries/${diary.id}`)} className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600">
              詳細
            </button>
            <button onClick={() => router.push(`/diaries/edit/${diary.id}`)} className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600">
              編集
            </button>
            <button onClick={() => handleDelete(diary.id)} className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600">
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiaryCards;
