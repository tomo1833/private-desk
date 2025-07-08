/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}", // Next.js
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // appディレクトリ構成にも対応
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: "var(--foreground)",
            a: {
              color: "var(--link-color)",
              "&:hover": {
                color: "var(--highlight)",
              },
            },
            h1: { color: "var(--foreground)" },
            h2: { color: "var(--foreground)" },
            blockquote: {
              borderLeftColor: "var(--border-color)",
              color: "var(--muted)",
              fontStyle: "italic",
            },
            code: {
              backgroundColor: "var(--card-bg)",
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // ← これが必要！
  ],
};
