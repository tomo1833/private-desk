"use client";

import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { BuiltInParserName } from "prettier";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const BlogEditor: React.FC<Props> = ({ value, onChange, className }) => {
  const [htmlMode, setHtmlMode] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate({ editor }) {
      if (!htmlMode) {
        onChange(editor.getHTML());
      }
    },
    editable: !htmlMode,
  });

  useEffect(() => {
    if (editor && !htmlMode && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, htmlMode, editor]);

  const toggleMode = async () => {
    if (!htmlMode) {
      try {
        const prettier = (await import("prettier/standalone")).default;
        const parserHtml = (await import("prettier/plugins/html")).default;
        const formatted = await prettier.format(value, {
          parser: "html" as BuiltInParserName,
          plugins: [parserHtml],
        });
        const cleaned = String(formatted).replace(
          /<p>\s*([\s\S]*?)\s*<\/p>/g,
          (_, p) => `<p>${p.trim()}</p>`,
        );
        onChange(cleaned);
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
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md transition-colors duration-200"
        >
          {htmlMode ? "リッチテキスト" : "HTML"}モード
        </button>
      </div>
      {htmlMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="form-textarea font-mono whitespace-pre w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 min-h-24 resize-vertical"
        />
      ) : (
        <EditorContent
          editor={editor}
          className="form-input min-h-[3rem] p-2"
        />
      )}
    </div>
  );
};

export default BlogEditor;
