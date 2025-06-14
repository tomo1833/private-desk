'use client';
import type { Diary } from '@/types/diary';
import { useRouter } from 'next/navigation';

type Props = { diaries: Diary[] };

const DiaryCards: React.FC<Props> = ({ diaries }) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {diaries.map((diary) => (
        <div key={diary.id} className="border rounded p-4 bg-white shadow">
          <h3 className="font-bold mb-2 truncate">{diary.title}</h3>
          <p className="line-clamp-3 text-sm whitespace-pre-wrap mb-2">{diary.content}</p>
          <button onClick={() => router.push(`/diaries/${diary.id}`)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
            詳細
          </button>
        </div>
      ))}
    </div>
  );
};

export default DiaryCards;
