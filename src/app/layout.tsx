import './globals.css';
import React, { Suspense } from 'react';
import Header from './components/Header';

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </head>
      <body className="font-sans flex flex-col min-h-screen gradient-bg selection:bg-indigo-500 selection:text-white">
        <Header />

        <main className="flex-grow p-3 sm:p-6 lg:p-8 overflow-auto mt-20 sm:mt-20 mb-14 sm:mb-16">
          <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-indigo-400 font-medium animate-pulse">読み込み中...</div>}>
            {children}
          </Suspense>
        </main>

        <footer className="bg-slate-900/60 backdrop-blur-md text-slate-400 py-3 sm:py-4 px-4 sm:px-6 fixed bottom-0 w-full z-10 shadow-lg border-t border-slate-800/80">
          <p className="text-center text-xs sm:text-sm text-slate-300 font-medium">© 2025 ～ 2026 Private Desk App</p>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
