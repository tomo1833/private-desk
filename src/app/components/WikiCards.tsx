'use client';
import type { Wiki } from '@/types/wiki';
import { useRouter } from 'next/navigation';

type Props = { wikis: Wiki[] };

const WikiCards: React.FC<Props> = ({ wikis }) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {wikis.map((wiki) => (
        <div key={wiki.id} className="border rounded p-4 bg-white shadow">
          <h3 className="font-bold mb-2 truncate">{wiki.title}</h3>
          <p className="line-clamp-3 text-sm whitespace-pre-wrap mb-2">{wiki.content}</p>
          <button
            onClick={() => router.push(`/wikis/${wiki.id}`)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            詳細
          </button>
        </div>
      ))}
    </div>
  );
};

export default WikiCards;
