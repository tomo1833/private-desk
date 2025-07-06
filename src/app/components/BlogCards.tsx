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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {blogs.map((blog) => (
        <div key={blog.id} className="border rounded p-4 bg-white shadow space-y-2">
          <h3 className="font-bold mb-2 truncate">{blog.title}</h3>
          <p className="line-clamp-3 text-sm whitespace-pre-wrap">{blog.content}</p>
          <div className="space-x-2">
            <button
              onClick={() => router.push(`/blogs/${blog.id}`)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              詳細
            </button>
            <button
              onClick={() => router.push(`/blogs/edit/${blog.id}`)}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              編集
            </button>
            <button
              onClick={() => handleDelete(blog.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
