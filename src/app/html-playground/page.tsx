'use client';
import { useState } from 'react';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';

const initialMarkdown = `# サンプルMarkdown\n\n- これはMarkdown表示例です\n- 上部に表示されます`; 

const initialHtml = `<p>ここにHTMLを書いてください</p>`;

const HtmlPlaygroundPage = () => {
  const [html, setHtml] = useState(initialHtml);

  return (
    <div className="card-form">
      <div className="form-header">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">HTMLプレイグラウンツ</h1>
        <p className="form-subtitle">HTMLコードを書いてリアルタイムでプレビューします</p>
      </div>
      <MarkdownRenderer>{initialMarkdown}</MarkdownRenderer>
      <div className="space-y-4 mb-6">
        <label className="form-label">HTMLコードエディタ &amp; プレビュー</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="form-textarea font-mono min-h-[300px]"
            placeholder="HTMLコードを入力..."
          />
          <div
            className="card-basic min-h-[300px] overflow-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
};

export default HtmlPlaygroundPage;
