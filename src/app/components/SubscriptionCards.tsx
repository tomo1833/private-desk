'use client';
import type { Subscription } from '@/types/subscription';
import { useRouter } from 'next/navigation';

type Props = { subscriptions: Subscription[] };

const SubscriptionCards: React.FC<Props> = ({ subscriptions }) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
      {subscriptions.map((s) => (
        <div
          key={s.id}
          className="card-basic group flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/40 hover:-translate-y-1 space-y-4"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm">
                  💻
                </span>
                <h3 className="font-bold text-base text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                  {s.name}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                ¥{Number(s.price).toLocaleString()}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">契約周期:</span>
                <span className="font-medium text-slate-200">
                  {s.cycle === 'monthly' ? '月額' : s.cycle === 'yearly' ? '年額' : s.cycle === 'one_time' ? '買い切り' : '無料'}
                </span>
              </div>
              {s.next_billing && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">次回更新:</span>
                  <span className="font-mono text-indigo-300">{s.next_billing}</span>
                </div>
              )}
              {s.account_email && (
                <div className="flex items-center justify-between truncate">
                  <span className="text-slate-400">アカウント:</span>
                  <span className="font-mono text-slate-300 truncate max-w-[160px]">{s.account_email}</span>
                </div>
              )}
            </div>

            {s.memo && (
              <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950/30 p-2 rounded-lg border border-slate-800/60">
                {s.memo}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800/80">
            <button
              onClick={() => router.push(`/subscriptions/${s.id}`)}
              className="btn btn-secondary text-xs px-3 py-1.5"
            >
              詳細・編集 →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionCards;
