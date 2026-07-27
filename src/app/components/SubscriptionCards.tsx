'use client';
import type { Subscription } from '@/types/subscription';
import { useRouter } from 'next/navigation';

type Props = { subscriptions: Subscription[] };

const SubscriptionCards: React.FC<Props> = ({ subscriptions }) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {subscriptions.map((s) => (
        <div
          key={s.id}
          className="card-basic transition-all duration-300 space-y-3"
        >
          <div className="flex justify-between items-start">
            <h3 className="font-bold truncate text-gray-900 dark:text-white">{s.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
              ¥{Number(s.price).toLocaleString()}
            </span>
          </div>

          <p className="text-xs text-gray-400">
            周期: {s.cycle === 'monthly' ? '月額' : s.cycle === 'yearly' ? '年額' : s.cycle === 'one_time' ? '買い切り' : '無料'}
            {s.next_billing && ` | 更新日: ${s.next_billing}`}
          </p>

          {s.account_email && (
            <p className="text-xs font-mono text-gray-300 truncate">
              アカウント: {s.account_email}
            </p>
          )}

          {s.memo && (
            <p className="text-xs text-gray-400 line-clamp-2">
              {s.memo}
            </p>
          )}

          <div className="flex justify-end pt-2 border-t border-gray-700">
            <button
              onClick={() => router.push(`/subscriptions/${s.id}`)}
              className="btn btn-primary text-xs"
            >
              詳細
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionCards;
