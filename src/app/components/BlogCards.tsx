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
          className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/40 shadow-lg transition-all duration-300 p-6 space-y-3"
        >
          <h3 className="font-bold mb-2 truncate text-gray-900 dark:text-white">{blog.title}</h3>
          <p className="line-clamp-3 text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">{blog.content}</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => router.push(`/blogs/${blog.id}`)}
              className="btn btn-primary"
            >
              詳細
            </button>
            <button
              onClick={() => router.push(`/blogs/edit/${blog.id}`)}
              className="btn btn-success"
            >
              編集
            </button>
            <button
              onClick={() => handleDelete(blog.id)}
              className="btn btn-danger"
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
