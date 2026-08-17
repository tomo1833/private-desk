'use client';
import type { Blog } from '@/types/blog';
import { useRouter } from 'next/navigation';

type Props = { blogs: Blog[]; onDelete?: (id: number) => void };

const BlogCards: React.FC<Props> = ({ blogs, onDelete }) => {
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {blogs.map((blog) => (
        <div
          key={blog.id}
          className="card-basic group flex flex-col justify-between transition-all duration-300 space-y-4 hover:border-violet-500/40"
        >
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-slate-100 group-hover:text-violet-300 transition-colors truncate">{blog.title}</h3>
            <p className="line-clamp-3 text-sm whitespace-pre-wrap text-slate-200 leading-relaxed">{blog.content}</p>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-700/80">
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
