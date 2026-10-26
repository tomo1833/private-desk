import React from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

export interface MarkdownRendererProps
  extends Omit<Options, 'children'> {
  children: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  children,
  className
}) => (
  <div className={`markdown-body max-w-none ${className || ''}`.trim()}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeRaw]}
    >
      {children}
    </ReactMarkdown>
  </div>
);

export default MarkdownRenderer;
