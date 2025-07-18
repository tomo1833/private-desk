'use client';
import dynamic from 'next/dynamic';
import React from 'react';
import ReactDOM from 'react-dom';
import 'react-quill/dist/quill.snow.css';

// Polyfill for ReactDOM.findDOMNode which was removed in React 19
type NodeLike = Element | { current?: Element | null } | null;

if (typeof window !== 'undefined' && !('findDOMNode' in ReactDOM)) {
  (ReactDOM as unknown as { findDOMNode(node: NodeLike): Element | null }).findDOMNode = (
    node: NodeLike,
  ): Element | null => {
    if (node && 'nodeType' in node && (node as Node).nodeType === Node.ELEMENT_NODE) {
      return node as Element;
    }
    if (node && 'current' in node) {
      return node.current ?? null;
    }
    return node as Element | null;
  };
}

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const BlogEditor: React.FC<Props> = ({ value, onChange, className }) => {
  return <ReactQuill theme="snow" value={value} onChange={onChange} className={className} />;
};

export default BlogEditor;
