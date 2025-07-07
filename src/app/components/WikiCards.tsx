'use client';
import type { Wiki } from '@/types/wiki';
import { useRouter } from 'next/navigation';

type Props = { wikis: Wiki[] };

const WikiCards: React.FC<Props> = ({ wikis }) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-5 gap-2">
      {wikis.map((wiki) => (
        <div
          key={wiki.id}
          className="sticky-note cursor-pointer"
          onClick={() => router.push(`/wikis/${wiki.id}`)}
        >
          <span className="sticky-note-title truncate">{wiki.title}</span>
          <span className="sticky-note-date">
            {new Date(wiki.created_at).toLocaleDateString('ja-JP')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default WikiCards;
