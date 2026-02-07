/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: "var(--foreground)",
            fontFamily: "var(--font-sans)",
            a: {
              color: "var(--link-color)",
              textDecoration: "underline",
              "&:hover": {
                color: "var(--highlight)",
              },
            },
            h1: {
              color: "var(--foreground)",
              fontSize: theme("fontSize.3xl"),
              borderBottom: `1px solid var(--border-color)`,
              paddingBottom: "0.3em",
              marginBottom: "0.8em",
              marginTop: "1.5em",
            },
            h2: {
              color: "var(--foreground)",
              fontSize: theme("fontSize.2xl"),
              borderLeft: `4px solid var(--accent-primary)`,
              paddingLeft: "0.6em",
              marginTop: "1.2em",
              marginBottom: "0.6em",
            },
            h3: {
              color: "var(--foreground)",
              fontSize: theme("fontSize.xl"),
              fontWeight: "600",
              marginTop: "1em",
              marginBottom: "0.5em",
            },
            blockquote: {
              color: "var(--muted)",
              borderLeftColor: "var(--accent-secondary)",
              fontStyle: "italic",
              paddingLeft: "1rem",
            },
            code: {
              backgroundColor: "var(--card-bg)",
              color: "var(--foreground)",
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
              fontSize: "0.85em",
            },
            pre: {
              backgroundColor: "#1f1f1f",
              color: "#f8f8f8",
              padding: "1rem",
              borderRadius: "0.5rem",
              overflowX: "auto",
            },
            hr: {
              borderColor: "var(--border-color)",
              margin: "2em 0",
            },
            ul: {
              listStyleType: "disc",
              paddingLeft: "1.5rem",
            },
            ol: {
              listStyleType: "decimal",
              paddingLeft: "1.5rem",
            },
          },
        },
        dark: {
          css: {
            color: "var(--foreground)",
            a: { color: "var(--link-color)" },
            blockquote: { color: "var(--muted)" },
            code: { backgroundColor: "var(--card-bg)" },
            pre: { backgroundColor: "#333", color: "#eee" },
          },
        },
      }),
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // ← これが必要！
  ],
};
