'use client';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored === 'dark' || (!stored && prefersDark);
    document.documentElement.classList.toggle('dark', dark);
    setIsDark(dark);
  }, []);

  const toggle = () => {
    const newDark = !isDark;
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    setIsDark(newDark);
  };

  return (
    <button
      onClick={toggle}
      aria-label="テーマ切替"
      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 hover:text-white transition-all text-xs font-medium cursor-pointer shadow-sm active:scale-95"
    >
      <span className="text-xs sm:text-sm">{isDark ? '☀️' : '🌙'}</span>
      <span className="hidden sm:inline">{isDark ? 'ライト' : 'ダーク'}</span>
    </button>
  );
};

export default ThemeToggle;
