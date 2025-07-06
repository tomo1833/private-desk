'use client';
import type { Wiki } from '@/types/wiki';
import { useRouter } from 'next/navigation';

type Props = { wikis: Wiki[]; onDelete?: (id: number) => void };

const WikiCards: React.FC<Props> = ({ wikis, onDelete }) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {wikis.map((wiki) => (
        <div key={wiki.id} className="border rounded p-4 bg-white shadow space-y-2">
          <h3 className="font-bold mb-2 truncate">{wiki.title}</h3>
          <p className="line-clamp-3 text-sm whitespace-pre-wrap">{wiki.content}</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => router.push(`/wikis/${wiki.id}`)}
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
            >
              詳細
            </button>
            <button
              onClick={() => router.push(`/wikis/edit/${wiki.id}`)}
              className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
            >
              編集
            </button>
            <button
              onClick={() => handleDelete(wiki.id)}
              className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WikiCards;
