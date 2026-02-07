'use client';
import type { Password } from '@/types/password';
import { useRouter } from 'next/navigation';

type Props = { passwords: Password[] };

const PasswordCards: React.FC<Props> = ({ passwords }) => {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {passwords.map((p) => (
        <div
          key={p.id}
          className="card-basic transition-all duration-300 space-y-3"
        >
          <h3 className="font-bold mb-2 truncate text-gray-900 dark:text-white">{p.site_name}</h3>
          <p className="text-sm break-all mb-1 text-gray-700 dark:text-gray-200">{p.site_url}</p>
          {p.login_id && <p className="text-sm break-all mb-1 text-gray-700 dark:text-gray-200">{p.login_id}</p>}
          <div className="flex justify-end">
            <button
              onClick={() => router.push(`/passwords/edit/${p.id}`)}
              className="btn btn-primary"
            >
              詳細
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PasswordCards;
