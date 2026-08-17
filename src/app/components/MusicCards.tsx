'use client';
import type { Music } from '@/types/music';
import { useRouter } from 'next/navigation';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';

type Props = {
  musics: Music[];
  viewMode?: 'card' | 'table';
  onDelete?: (id: number) => void;
};

const MusicCards: React.FC<Props> = ({ musics, viewMode = 'card', onDelete }) => {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/music/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (onDelete) onDelete(id);
    } else {
      alert('削除失敗');
    }
  };

  if (viewMode === 'table') {
    return (
      <div className="table-container">
        <table className="table-basic">
          <thead>
            <tr>
              <th className="table-header w-1/3">タイトル / 曲名</th>
              <th className="table-header">メモ・内容</th>
              <th className="table-header w-32">登録日</th>
              <th className="table-header text-right w-44">操作</th>
            </tr>
          </thead>
          <tbody>
            {musics.map((music) => (
              <tr key={music.id} className="table-row">
                <td className="table-cell font-semibold text-slate-100">
                  <button
                    onClick={() => router.push(`/musics/${music.id}`)}
                    className="hover:underline text-left text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    🎵 {music.title}
                  </button>
                </td>
                <td className="table-cell text-xs text-slate-300">
                  <p className="line-clamp-2">{music.content}</p>
                </td>
                <td className="table-cell text-xs font-mono text-slate-400">
                  {music.created_at ? new Date(music.created_at).toLocaleDateString('ja-JP') : '-'}
                </td>
                <td className="table-cell text-right space-x-2">
                  <button
                    onClick={() => router.push(`/musics/${music.id}`)}
                    className="btn btn-secondary text-xs px-2.5 py-1"
                  >
                    詳細
                  </button>
                  <button
                    onClick={() => router.push(`/musics/edit/${music.id}`)}
                    className="btn btn-success text-xs px-2.5 py-1"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(music.id)}
                    className="btn btn-danger text-xs px-2.5 py-1"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {musics.map((music) => (
        <div
          key={music.id}
          className="card-basic group flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-emerald-500/40 hover:-translate-y-1 space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm shrink-0">
                🎵
              </span>
              <h3
                onClick={() => router.push(`/musics/${music.id}`)}
                className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-emerald-300 transition-colors cursor-pointer truncate flex-1"
              >
                {music.title}
              </h3>
            </div>
            <MarkdownRenderer className="line-clamp-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {music.content}
            </MarkdownRenderer>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/80 text-xs">
            <span className="text-slate-400 font-mono">
              {music.created_at ? new Date(music.created_at).toLocaleDateString('ja-JP') : ''}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push(`/musics/${music.id}`)} 
                className="btn btn-secondary text-xs px-2.5 py-1"
              >
                詳細
              </button>
              <button 
                onClick={() => router.push(`/musics/edit/${music.id}`)} 
                className="btn btn-success text-xs px-2.5 py-1"
              >
                編集
              </button>
              <button 
                onClick={() => handleDelete(music.id)} 
                className="btn btn-danger text-xs px-2.5 py-1"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MusicCards;
