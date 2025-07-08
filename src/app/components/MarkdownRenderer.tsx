import React from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export interface MarkdownRendererProps
  extends Omit<Options, 'children'> {
  children: string;
  className?: string;
}

const allowedElements = [
  'p',
  'strong',
  'em',
  'blockquote',
  'code',
  'pre',
  'a',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'br',
];

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  children,
  className,
  ...props
}) => (
  <ReactMarkdown
    className={className}
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeHighlight]}
    allowedElements={allowedElements}
    {...props}
  >
    {children}
  </ReactMarkdown>
);

export default MarkdownRenderer;
