"use client";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import type { BuiltInParserName } from "prettier";

// TinyMCE React component is dynamically imported to avoid SSR issues
const TinyMCEEditor = dynamic(
  () => import("@tinymce/tinymce-react").then((m) => m.Editor),
  { ssr: false }
) as unknown as typeof import("@tinymce/tinymce-react").Editor;

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const BlogEditor: React.FC<Props> = ({ value, onChange, className }) => {
  const [htmlMode, setHtmlMode] = useState(false);

  const toggleMode = async () => {
    if (!htmlMode) {
      try {
        const prettier = (await import("prettier/standalone")).default;
        const parserHtml = (await import("prettier/plugins/html")).default;
        const formatted = await prettier.format(value, {
          parser: "html" as BuiltInParserName,
          plugins: [parserHtml],
        });
        onChange(String(formatted));
      } catch (err) {
        console.error("format error", err);
      }
    }
    setHtmlMode(!htmlMode);
  };

  return (
    <div className={className}>
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={toggleMode}
          className="text-sm bg-gray-200 px-2 py-1 rounded"
        >
          {htmlMode ? "リッチテキスト" : "HTML"}モード
        </button>
      </div>
      {htmlMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border p-2 rounded h-48 font-mono whitespace-pre"
        />
      ) : (
        <TinyMCEEditor
          value={value}
          onEditorChange={(content) => onChange(content)}
          init={{ menubar: false }}
        />
      )}
    </div>
  );
};

export default BlogEditor;
