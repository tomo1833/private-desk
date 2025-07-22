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
    <button onClick={toggle} className="bg-white/20 backdrop-blur-sm border border-white/30 text-gray-900 dark:text-white hover:bg-white/30 dark:hover:bg-gray-700/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ml-2">
      {isDark ? 'ライト' : 'ダーク'}
    </button>
  );
};

export default ThemeToggle;
