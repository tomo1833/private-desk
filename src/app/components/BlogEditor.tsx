'use client';
import dynamic from 'next/dynamic';
import React from 'react';
import ReactDOM from 'react-dom';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const BlogEditor: React.FC<Props> = ({ value, onChange, className }) => {
  if (typeof window !== 'undefined') {
    // ReactQuill internally expects window.ReactDOM with findDOMNode
    // which may not be available when using React 18+/Next.js
    // Attach ReactDOM for compatibility
    (window as any).ReactDOM = ReactDOM;
  }
  return <ReactQuill theme="snow" value={value} onChange={onChange} className={className} />;
};

export default BlogEditor;
