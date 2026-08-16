'use client';
import type { Password } from '@/types/password';
import { useRouter } from 'next/navigation';

type Props = { passwords: Password[] };

const PasswordCards: React.FC<Props> = ({ passwords }) => {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {passwords.map((p) => (
        <div
          key={p.id}
          className="card-basic group flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-emerald-500/40 hover:-translate-y-1 space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                🔐
              </span>
              <h3 className="font-bold text-base text-slate-100 group-hover:text-emerald-300 transition-colors truncate flex-1">
                {p.site_name}
              </h3>
            </div>
            
            <div className="space-y-1 text-xs">
              {p.login_id && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">ID:</span>
                  <span className="font-mono text-slate-200">{p.login_id}</span>
                </div>
              )}
              {p.site_url && (
                <div className="flex items-center justify-between text-slate-300 truncate">
                  <span className="text-slate-400">URL:</span>
                  <span className="font-mono text-indigo-400 truncate max-w-[180px]">{p.site_url}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800/80">
            <button
              onClick={() => router.push(`/passwords/edit/${p.id}`)}
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

export default PasswordCards;
