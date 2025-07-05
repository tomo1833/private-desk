'use client';
import type { Blog } from '@/types/blog';
import { useRouter } from 'next/navigation';

type Props = { blogs: Blog[] };

const BlogCards: React.FC<Props> = ({ blogs }) => {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {blogs.map((blog) => (
        <div key={blog.id} className="border rounded p-4 bg-white shadow">
          <h3 className="font-bold mb-2 truncate">{blog.title}</h3>
          <p className="line-clamp-3 text-sm whitespace-pre-wrap mb-2">{blog.content}</p>
          <button
            onClick={() => router.push(`/blogs/${blog.id}`)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            詳細
          </button>
        </div>
      ))}
    </div>
  );
};

export default BlogCards;
