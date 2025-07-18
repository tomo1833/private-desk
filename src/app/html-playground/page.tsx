'use client';
import { useState } from 'react';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';

const initialMarkdown = `# サンプルMarkdown\n\n- これはMarkdown表示例です\n- 上部に表示されます`; 

const initialHtml = `<p>ここにHTMLを書いてください</p>`;

const HtmlPlaygroundPage = () => {
  const [html, setHtml] = useState(initialHtml);

  return (
    <div className="space-y-4">
      <MarkdownRenderer>{initialMarkdown}</MarkdownRenderer>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="w-full border p-2 rounded min-h-[300px]"
        />
        <div
          className="w-full border p-2 rounded bg-white"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
};

export default HtmlPlaygroundPage;
