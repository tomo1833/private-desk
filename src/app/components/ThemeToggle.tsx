'use client';

const ThemeToggle = () => {
  const toggle = () => {
    const newDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      aria-label="テーマ切替"
      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 hover:text-white transition-all text-xs font-medium cursor-pointer shadow-sm active:scale-95"
    >
      <span className="text-xs sm:text-sm dark:hidden">🌙</span>
      <span className="hidden text-xs sm:text-sm dark:inline">☀️</span>
      <span className="hidden sm:inline dark:hidden">ダーク</span>
      <span className="hidden dark:inline">ライト</span>
    </button>
  );
};

export default ThemeToggle;
