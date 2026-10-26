'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-slate-900/75 backdrop-blur-md text-white py-3 sm:py-3.5 px-4 sm:px-8 fixed top-0 w-full z-10 z-50 shadow-lg border-b border-slate-800/80">
        <div className="max-w-[2360px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-base sm:text-lg font-bold">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                  <span className="text-white text-sm font-bold">PD</span>
                </div>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight text-lg hidden xs:inline">
                  Private Desk
                </span>
                <span className="sr-only"> - このアプリの共通レイアウト</span>
              </Link>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <form
              action="/search"
              className="flex rounded-lg overflow-hidden shadow-md bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all"
            >
              <input
                type="text"
                name="q"
                placeholder="検索"
                className="px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-400 outline-none bg-transparent w-28 sm:w-44 md:w-56 focus:w-36 sm:focus:w-60 transition-all duration-200"
              />
              <button
                type="submit"
                aria-label="検索"
                className="px-2.5 sm:px-3 hover:bg-slate-700/60 transition-colors flex items-center justify-center"
              >
                <Image src="/search.svg" alt="検索" width={16} height={16} className="opacity-80 hover:opacity-100" />
              </button>
            </form>

            <ThemeToggle />

            {/* ハンバーガーメニューボタン（モバイルのみ） */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden flex items-center justify-center p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 shadow-sm transition-all active:scale-95"
              aria-label="メニューを開く"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ドロップダウンメニュー（モバイルのみ） */}
      <div
        className={`
          fixed top-14 left-0 right-0 sm:hidden
          bg-slate-900/95 backdrop-blur-2xl
          shadow-2xl border-b border-slate-800/80
          transition-all duration-300 ease-in-out z-40
          ${menuOpen ? 'max-h-[85vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}
        `}
      >
        <div className="p-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">記録 & ナレッジ</div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/wikis" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>📝 Wiki</Link>
              <Link href="/blogs" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>✍️ ブログ</Link>
              <Link href="/narous" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>📖 なろう小説</Link>
              <Link href="/diaries" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>📔 日記一覧</Link>
              <Link href="/authors" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>👤 著者</Link>
              <Link href="/personas" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>🎭 ペルソナ</Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">エンタメ & 学習</div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/animes" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>🎬 アニメ記録</Link>
              <Link href="/books" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>📚 本</Link>
              <Link href="/movies" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>🎞 映画</Link>
              <Link href="/musics" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>🎵 音楽</Link>
              <Link href="/udemys" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>🎓 Udemy</Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">ツール & 管理</div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/passwords" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>🔐 パスワード</Link>
              <Link href="/expenses" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>💰 家計簿</Link>
              <Link href="/wishlists" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>🎁 ほしいもの</Link>
              <Link href="/stocks" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>📈 日本株</Link>
              <Link href="/subscriptions" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>💻 サブスク</Link>
              <Link href="/files" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>📁 ファイル</Link>
              <Link href="/schedule" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>📅 カレンダー</Link>
              <Link href="/wbs" className="btn btn-primary text-xs py-2" onClick={() => setMenuOpen(false)}>📊 WBS</Link>
              <Link href="/sql" className="btn btn-secondary text-xs py-2" onClick={() => setMenuOpen(false)}>🛢 SQL</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
