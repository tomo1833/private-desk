import React from 'react';
import type { Music } from '@/types/music';
import { useRouter } from 'next/navigation';

type Props = { musics: Music[]; onDelete?: (id: number) => void };

const MusicCards: React.FC<Props> = ({ musics, onDelete }) => {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/music/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (onDelete) onDelete(id);
      alert('削除成功');
    } else {
      alert('削除失敗');
    }
  };

  return (
    <div className="grid-responsive">
      {musics.map((music) => (
        <div
          key={music.id}
          className="card-basic transition-all duration-300 hover:shadow-xl hover:scale-[1.02] space-y-3"
        >
          <h3 className="font-bold mb-2 text-base sm:text-lg truncate text-gray-900 dark:text-white">{music.title}</h3>
          <p className="line-clamp-3 text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">{music.content}</p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => router.push(`/musics/${music.id}`)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              詳細
            </button>
            <button
              onClick={() => router.push(`/musics/edit/${music.id}`)}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              編集
            </button>
            <button
              onClick={() => handleDelete(music.id)}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MusicCards;
