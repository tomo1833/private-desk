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
          className="border rounded p-4 bg-blue-50 dark:bg-gray-800 shadow space-y-2"
        >
          <h3 className="font-bold mb-2 truncate">{p.site_name}</h3>
          <p className="text-sm break-all mb-1">{p.site_url}</p>
          {p.login_id && <p className="text-sm break-all mb-1">{p.login_id}</p>}
          <div className="flex justify-end">
            <button
              onClick={() => router.push(`/passwords/edit/${p.id}`)}
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
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
