import './globals.css';
import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './components/ThemeToggle';

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="ja">
      <body className="font-sans flex flex-col min-h-screen gradient-bg">
        <header className="bg-white/10 backdrop-blur-md text-gray-900 dark:text-white py-4 px-6 fixed top-0 w-full z-10 flex justify-between items-center shadow-lg border-b border-gray-200/20">
          <h1 className="text-lg font-bold">
            <Link href="/" className="block">
              プライベートデスク
              <span className="sr-only"> - このアプリの共通レイアウト</span>
            </Link>
          </h1>
          <div className="flex items-center space-x-2">
            <form action="/search" className="flex bg-white/20 backdrop-blur-sm rounded-lg overflow-hidden shadow-md border border-white/30">
              <input
                type="text"
                name="q"
                placeholder="検索"
                className="px-3 py-2 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-300 outline-none bg-transparent"
              />
              <button type="submit" className="px-3 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-colors">
                <Image src="/search.svg" alt="検索" width={20} height={20} />
              </button>
            </form>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-grow p-6 overflow-auto mt-16 mb-16">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </main>

        <footer className="bg-gray-900/10 backdrop-blur-md text-gray-900 dark:text-white py-4 px-6 fixed bottom-0 w-full z-10 shadow-lg border-t border-gray-200/20">
          <p className="text-center text-sm text-gray-700 dark:text-gray-300">© 2025 Private Desk App</p>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
