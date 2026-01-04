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
      <body className="font-sans flex flex-col min-h-screen gradient-bg">
        <Header />

        <main className="flex-grow p-3 sm:p-6 overflow-auto mt-20 sm:mt-16 mb-14 sm:mb-16">
          <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
            {children}
          </Suspense>
        </main>

        <footer className="bg-gray-900/10 backdrop-blur-md text-gray-900 dark:text-white py-3 sm:py-4 px-4 sm:px-6 fixed bottom-0 w-full z-50 shadow-lg border-t border-gray-200/20">
          <p className="text-center text-xs sm:text-sm text-gray-700 dark:text-gray-300">© 2025 Private Desk App</p>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
