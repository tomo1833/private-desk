'use client';
import dynamic from 'next/dynamic';
import React from 'react';
// ReactQuill still relies on the legacy `ReactDOM.findDOMNode` API which was
// removed from React 19. We provide a minimal polyfill that simply returns the
// given DOM element. This is sufficient because the ref passed to ReactQuill's
// editing area already resolves to the underlying element.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findDOMNode = (node: any) => node;
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const BlogEditor: React.FC<Props> = ({ value, onChange, className }) => {
  if (typeof window !== 'undefined') {
    // ReactQuill internally expects `window.ReactDOM.findDOMNode`. React 19
    // removes this API, so we expose a lightweight polyfill that simply
    // returns the DOM element passed to it.
    (window as any).ReactDOM = { findDOMNode };
  }
  return <ReactQuill theme="snow" value={value} onChange={onChange} className={className} />;
};

export default BlogEditor;
