'use client';
import type { Wiki } from '@/types/wiki';
import Link from 'next/link';

type Props = { wikis: Wiki[] };

const WikiCards: React.FC<Props> = ({ wikis }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {wikis.map((wiki) => (
      <div key={wiki.id} className="border rounded p-4 bg-white shadow">
        <h3 className="font-bold mb-2 truncate">{wiki.title}</h3>
        <p className="line-clamp-3 text-sm whitespace-pre-wrap mb-2">{wiki.content}</p>
        <Link href={`/wikis/${wiki.id}`} className="text-blue-600 hover:underline">詳細</Link>
      </div>
    ))}
  </div>
);

export default WikiCards;
