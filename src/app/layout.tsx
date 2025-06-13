import './globals.css';
import React from 'react';
import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="ja">
      <body className="font-sans flex flex-col min-h-screen">
        <header className="bg-blue-500 text-white py-4 px-6 fixed top-0 w-full z-10 flex justify-between">
          <h1 className="text-lg font-bold">
            <Link href="/" className="block focus:outline-none focus:ring">
              プライベートデスク
              <span className="sr-only"> - このアプリの共通レイアウト</span>
            </Link>
          </h1>
          <ThemeToggle />
        </header>

        <main className="flex-grow p-6 overflow-auto mt-16 mb-16">
          {children}
        </main>

        <footer className="bg-gray-700 text-white py-4 px-6 fixed bottom-0 w-full z-10">
          <p className="text-center text-sm">© 2025 Private Desk App</p>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;