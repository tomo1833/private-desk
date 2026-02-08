'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white/10 backdrop-blur-md text-white py-3 sm:py-4 px-4 sm:px-6 fixed top-0 w-full z-50 shadow-lg border-b border-gray-200/20">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-base sm:text-lg font-bold">
            <Link href="/" className="block">
              Private Desk
              <span className="sr-only"> - このアプリの共通レイアウト</span>
            </Link>
          </h1>
          <div className="flex items-center gap-2">
            {/* ハンバーガーメニューボタン（モバイルのみ） */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden flex items-center justify-center p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-purple-700 transition-all active:scale-95"
              aria-label="メニューを開く"
            >
              <svg
                className="w-6 h-6"
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

            <form action="/search" className="hidden sm:flex bg-white/20 backdrop-blur-sm rounded-lg overflow-hidden shadow-md border border-white/30">
              <input
                type="text"
                name="q"
                placeholder="検索"
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-white placeholder-gray-300 outline-none bg-transparent w-full"
              />
              <button type="submit" className="px-2 sm:px-3 hover:bg-white/20 transition-colors">
                <Image src="/search.svg" alt="検索" width={18} height={18} className="sm:w-5 sm:h-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ドロップダウンメニュー（モバイルのみ） */}
      <div
        className={`
          fixed top-16 left-0 right-0 sm:hidden
          bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg
          shadow-2xl border-b border-gray-200/50 dark:border-gray-700/50
          transition-all duration-300 ease-in-out z-40
          ${menuOpen ? 'max-h-[40rem] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
        `}
      >
        <div className="p-4 grid grid-cols-2 gap-3">
          <Link
            href="/wikis"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            📝 Wiki
          </Link>
          <Link
            href="/blogs"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            ✍️ ブログ
          </Link>
          <Link
            href="/animes"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            🎬 アニメ記録
          </Link>
          <Link
            href="/books"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            📚 本
          </Link>
          <Link
            href="/movies"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            🎞 映画
          </Link>
          <Link
            href="/narous"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            📖 なろう小説
          </Link>
          <Link
            href="/udemys"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            🎓 Udemy
          </Link>
          <Link
            href="/passwords"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            🔐 パスワード
          </Link>
          <Link
            href="/expenses"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            💰 家計簿
          </Link>
          <Link
            href="/files"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            📁 ファイル
          </Link>
          <Link
            href="/schedule"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            📅 カレンダー
          </Link>
          <Link
            href="/sql"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            🛢 SQL
          </Link>
          <Link
            href="/authors"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            👤 著者
          </Link>
          <Link
            href="/personas"
            className="btn btn-secondary text-sm"
            onClick={() => setMenuOpen(false)}
          >
            🎭 ペルソナ
          </Link>
        </div>
      </div>
    </>
  );
};

export default Header;
