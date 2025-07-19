"use client";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import type { BuiltInParserName } from "prettier";
import ReactDOM from "react-dom";
import "react-quill/dist/quill.snow.css";

// Polyfill for ReactDOM.findDOMNode which was removed in React 19
type NodeLike = Element | { current?: Element | null } | null;

if (typeof window !== "undefined" && !("findDOMNode" in ReactDOM)) {
  (
    ReactDOM as unknown as { findDOMNode(node: NodeLike): Element | null }
  ).findDOMNode = (node: NodeLike): Element | null => {
    if (
      node &&
      "nodeType" in node &&
      (node as Node).nodeType === Node.ELEMENT_NODE
    ) {
      return node as Element;
    }
    if (node && "current" in node) {
      return node.current ?? null;
    }
    return node as Element | null;
  };
}

const ReactQuill = dynamic(
  async () => {
    const mod = await import("react-quill");
    const Quill = (mod as any).Quill ?? (mod.default as any).Quill;
    if (!Quill) {
      throw new Error("Quill not found in react-quill module");
    }
    const Block = Quill.import("blots/block");
    class DivBlock extends Block {}
    DivBlock.blotName = "div";
    DivBlock.tagName = "div";
    Quill.register(DivBlock, true);
    return mod.default;
  },
  { ssr: false },
) as typeof import("react-quill");

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
        <ReactQuill theme="snow" value={value} onChange={onChange} />
      )}
    </div>
  );
};

export default BlogEditor;
