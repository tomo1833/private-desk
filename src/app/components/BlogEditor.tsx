'use client';
import dynamic from 'next/dynamic';
import React from 'react';
import ReactDOM from 'react-dom';
import 'react-quill/dist/quill.snow.css';

// Polyfill for ReactDOM.findDOMNode which was removed in React 19
if (typeof window !== 'undefined' && !ReactDOM.findDOMNode) {
  (ReactDOM as any).findDOMNode = (node: any) => {
    if (node && node.nodeType === Node.ELEMENT_NODE) {
      return node;
    }
    return node?.current || node;
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
