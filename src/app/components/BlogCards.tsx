'use client';
import type { Blog } from '@/types/blog';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Props = {
  blogs: Blog[];
  viewMode?: 'card' | 'table';
  onDelete?: (id: number) => void;
};

const BlogCards: React.FC<Props> = ({ blogs, viewMode = 'card', onDelete }) => {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
    if (res.ok) {
      onDelete?.(id);
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
              <th className="table-header w-1/3">記事タイトル</th>
              <th className="table-header">著者 / ペルソナ</th>
              <th className="table-header">内容プレビュー</th>
              <th className="table-header w-32">投稿日</th>
              <th className="table-header text-right w-44">操作</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id} className="table-row">
                <td className="table-cell font-semibold text-slate-100">
                  <button
                    onClick={() => router.push(`/blogs/${blog.id}`)}
                    className="hover:underline text-left text-violet-400 hover:text-violet-300 font-medium line-clamp-1"
                  >
                    📝 {blog.title}
                  </button>
                </td>
                <td className="table-cell text-xs text-slate-300">
                  <span>{blog.author || '-'}</span>
                  {blog.persona && <span className="text-slate-400 text-xs ml-1">({blog.persona})</span>}
                </td>
                <td className="table-cell text-xs text-slate-300">
                  <p className="line-clamp-2">{blog.content}</p>
                </td>
                <td className="table-cell text-xs font-mono text-slate-400">
                  {blog.created_at ? new Date(blog.created_at).toLocaleDateString('ja-JP') : '-'}
                </td>
                <td className="table-cell text-right space-x-2">
                  <button
                    onClick={() => router.push(`/blogs/${blog.id}`)}
                    className="btn btn-secondary text-xs px-2.5 py-1"
                  >
                    詳細
                  </button>
                  <button
                    onClick={() => router.push(`/blogs/edit/${blog.id}`)}
                    className="btn btn-success text-xs px-2.5 py-1"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <div
          key={blog.id}
          className="card-basic group flex flex-col justify-between transition-all duration-300 space-y-4 hover:border-violet-500/40 hover:-translate-y-1"
        >
          <div className="space-y-3">
            {blog.eyecatch && (
              <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60">
                <Image
                  src={blog.eyecatch}
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="flex items-center justify-between gap-2 text-xs text-slate-400 font-mono">
              <span>{blog.author ? `👤 ${blog.author}` : ''}</span>
              <span>{blog.created_at ? new Date(blog.created_at).toLocaleDateString('ja-JP') : ''}</span>
            </div>
            <h3
              onClick={() => router.push(`/blogs/${blog.id}`)}
              className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-violet-300 transition-colors cursor-pointer truncate"
            >
              {blog.title}
            </h3>
            <p className="line-clamp-3 text-xs sm:text-sm whitespace-pre-wrap text-slate-300 leading-relaxed">
              {blog.content}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/80">
            <button
              onClick={() => router.push(`/blogs/${blog.id}`)}
              className="btn btn-secondary text-xs px-3 py-1.5"
            >
              詳細
            </button>
            <button
              onClick={() => router.push(`/blogs/edit/${blog.id}`)}
              className="btn btn-success text-xs px-3 py-1.5"
            >
              編集
            </button>
            <button
              onClick={() => handleDelete(blog.id)}
              className="btn btn-danger text-xs px-3 py-1.5"
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogCards;
