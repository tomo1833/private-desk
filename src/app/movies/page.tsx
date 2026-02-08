'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Movie } from '@/types/movie';

const MovieListPage = () => {
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/movie');
        if (!res.ok) throw new Error('読み込み失敗');
        const data: Movie[] = await res.json();
        setMovies(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, []);

  if (error) return <div className="text-red-500 text-center p-4">読み込みエラー</div>;
  if (!movies) return <div className="text-center p-4">読み込み中...</div>;

  return (
    <div className="space-y-4 page-wrap">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">映画の記録一覧</h1>
        <Link href="/movies/new" className="btn btn-primary text-center">
          新規作成
        </Link>
      </div>
      
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <li 
            key={movie.id} 
            className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] p-4 sm:p-6 space-y-3"
          >
            <Link 
              href={`/movies/${movie.id}`} 
              className="font-semibold text-lg hover:underline block text-gray-900 dark:text-white line-clamp-2"
            >
              {movie.title}
            </Link>
            <MarkdownRenderer className="line-clamp-3 text-sm text-gray-700 dark:text-gray-300">
              {movie.content}
            </MarkdownRenderer>
            <div className="flex justify-end pt-2">
              <Link 
                href={`/movies/${movie.id}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                続きを読む →
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {movies.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <p className="text-lg mb-4">まだ映画の記録がありません</p>
          <Link href="/movies/new" className="btn btn-primary inline-block">
            最初の記録を作成
          </Link>
        </div>
      )}
    </div>
  );
};

export default MovieListPage;
