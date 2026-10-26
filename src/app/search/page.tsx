'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PasswordCards from '../components/PasswordCards';
import DiaryCards from '../components/DiaryCards';
import WikiCards from '../components/WikiCards';
import BlogCards from '../components/BlogCards';
import AnimeCards from '../components/AnimeCards';
import BookCards from '../components/BookCards';
import MovieCards from '../components/MovieCards';
import NarouCards from '../components/NarouCards';
import UdemyCards from '../components/UdemyCards';
import MusicCards from '../components/MusicCards';
import SubscriptionCards from '../components/SubscriptionCards';
import type { Password } from '@/types/password';
import type { Diary } from '@/types/diary';
import type { Wiki } from '@/types/wiki';
import type { Blog } from '@/types/blog';
import type { Anime } from '@/types/anime';
import type { Book } from '@/types/book';
import type { Movie } from '@/types/movie';
import type { Narou } from '@/types/narou';
import type { Udemy } from '@/types/udemy';
import type { Music } from '@/types/music';
import type { Subscription } from '@/types/subscription';

interface Results {
  passwords: Password[];
  diaries: Diary[];
  wikis: Wiki[];
  blogs: Blog[];
  animes: Anime[];
  books: Book[];
  movies: Movie[];
  narous: Narou[];
  udemys: Udemy[];
  musics: Music[];
  subscriptions: Subscription[];
}

const SearchPage = () => {
  const params = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!q) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('検索に失敗しました');
        const data: Results = await res.json();
        setResults(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
  }, [q]);

  if (!q) return <div className="page-wrap p-8 text-center text-slate-300 card-basic">検索ワードを入力してください。</div>;
  if (error) return <div className="page-wrap p-8 text-center text-rose-400 card-basic">{error}</div>;
  if (!results) return <div className="page-wrap p-8 text-center text-slate-300 card-basic">検索中...</div>;

  return (
    <div className="page-wrap space-y-8">
      <div className="card-basic p-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
          🔍 検索結果: <span className="text-indigo-400">{q}</span>
        </h1>
      </div>

      <section className="space-y-3">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">💻 ソフトウェア・サブスク</h2>
        {results.subscriptions && results.subscriptions.length > 0 ? (
          <SubscriptionCards subscriptions={results.subscriptions} />
        ) : (
          <p className="text-slate-400 text-xs italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">該当なし</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">🔐 パスワード</h2>
        {results.passwords.length > 0 ? (
          <PasswordCards passwords={results.passwords} />
        ) : (
          <p className="text-slate-400 text-xs italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">該当なし</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">📌 Wiki</h2>
        {results.wikis.length > 0 ? (
          <WikiCards wikis={results.wikis} />
        ) : (
          <p className="text-slate-400 text-xs italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">該当なし</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">📝 日報</h2>
        {results.diaries.length > 0 ? (
          <DiaryCards diaries={results.diaries} />
        ) : (
          <p className="text-slate-400 text-xs italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">該当なし</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">📰 ブログ</h2>
        {results.blogs.length > 0 ? (
          <BlogCards blogs={results.blogs} />
        ) : (
          <p className="text-slate-400 text-xs italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">該当なし</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">🎬 アニメ記録</h2>
        {results.animes.length > 0 ? (
          <AnimeCards animes={results.animes} />
        ) : (
          <p className="text-slate-400 text-xs italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">該当なし</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">📚 本</h2>
        {results.books.length > 0 ? (
          <BookCards books={results.books} />
        ) : (
          <p className="text-slate-400 text-xs italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">該当なし</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">🎞 映画</h2>
        {results.movies.length > 0 ? (
          <MovieCards movies={results.movies} />
        ) : (
          <p className="text-slate-400 text-xs italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">該当なし</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">📖 なろう小説</h2>
        {results.narous.length > 0 ? (
          <NarouCards narous={results.narous} />
        ) : (
          <p className="text-slate-400 text-xs italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">該当なし</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">🎓 Udemy</h2>
        {results.udemys.length > 0 ? (
          <UdemyCards udemys={results.udemys} />
        ) : (
          <p className="text-slate-400 text-xs italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">該当なし</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">🎵 音楽</h2>
        {results.musics.length > 0 ? (
          <MusicCards musics={results.musics} />
        ) : (
          <p className="text-slate-400 text-xs italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">該当なし</p>
        )}
      </section>
    </div>
  );
};

export default SearchPage;
