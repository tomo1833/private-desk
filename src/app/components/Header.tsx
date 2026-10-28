'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { APP_FEATURE_GROUPS } from '@/app/features';

const Header = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-700/70 bg-slate-950/90 text-slate-100 shadow-lg shadow-black/10 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-3 px-3 sm:gap-5 sm:px-6">
          <Link
            href="/"
            aria-label="Private Desk ホーム"
            className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white shadow-md shadow-indigo-950/40"
            >
              PD
            </span>
            <span className="hidden text-base font-semibold tracking-tight text-slate-100 sm:inline">
              Private Desk
            </span>
            <span className="sr-only"> - このアプリの共通レイアウト</span>
          </Link>

          <form
            action="/search"
            role="search"
            aria-label="サイト内検索"
            className="flex min-w-0 max-w-xl flex-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-900/80 shadow-inner transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/25"
          >
            <label htmlFor="site-search" className="sr-only">
              サイト内を検索
            </label>
            <input
              id="site-search"
              type="text"
              name="q"
              placeholder="検索"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400 sm:px-4"
            />
            <button
              type="submit"
              aria-label="検索"
              className="flex shrink-0 items-center justify-center px-3 text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400"
            >
              <Image src="/search.svg" alt="検索" width={16} height={16} />
            </button>
          </form>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={async () => {
                try {
                  const response = await fetch('/api/app-auth/logout', { method: 'POST' });
                  if (!response.ok) throw new Error('ログアウトに失敗しました。');
                  router.push('/login');
                } catch (error) {
                  console.error('Failed to log out:', error);
                  window.alert('ログアウトに失敗しました。通信状態を確認してください。');
                }
              }}
              aria-label="ログアウト"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-2.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:px-3"
            >
              <span aria-hidden="true" className="sm:hidden">↪</span>
              <span className="hidden sm:inline">ログアウト</span>
            </button>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? '機能メニューを閉じる' : '機能メニューを開く'}
              aria-expanded={menuOpen}
              aria-controls="feature-menu"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-2.5 text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:px-3"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
              <span className="hidden text-sm font-medium sm:inline">機能</span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="機能メニューを閉じる"
            onClick={closeMenu}
            className="fixed inset-0 z-40 cursor-default bg-slate-950/40"
          />
          <nav
            id="feature-menu"
            aria-label="機能メニュー"
            className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-slate-700/80 bg-slate-950/95 shadow-2xl shadow-black/30 backdrop-blur-xl"
          >
            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
              {APP_FEATURE_GROUPS.map((group) => (
                <section key={group.id} aria-labelledby={`menu-${group.id}`}>
                  <div className="mb-3">
                    <h2
                      id={`menu-${group.id}`}
                      className="flex items-center gap-2 text-sm font-semibold text-slate-100"
                    >
                      <span aria-hidden="true">{group.icon}</span>
                      {group.title}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {group.description}
                    </p>
                  </div>
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-1">
                    {group.features.map((feature) => (
                      <li key={feature.href}>
                        <Link
                          href={feature.href}
                          onClick={closeMenu}
                          className="group flex min-h-11 items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                        >
                          <span aria-hidden="true" className="text-base">
                            {feature.icon}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{feature.name}</span>
                          <span aria-hidden="true" className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-indigo-300">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </nav>
        </>
      )}
    </>
  );
};

export default Header;
