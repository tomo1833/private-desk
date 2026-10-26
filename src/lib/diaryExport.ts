import type { Diary } from '@/types/diary';

/**
 * AI評価用の標準プロンプト付きMarkdownテキストを生成
 */
export function formatDiaryForAIEvaluation(diary: Diary): string {
  const dateStr = diary.date
    ? new Date(diary.date).toLocaleDateString('ja-JP')
    : new Date(diary.created_at).toLocaleDateString('ja-JP');

  return `# 日報評価依頼

以下の日報を読み、以下の観点から評価・フィードバックを行ってください：
1. **良かった点・達成できたこと**の分析
2. **課題や改善点**の抽出
3. **具体的なアドバイスや次のアクション提案**

---

## タイトル: ${diary.title}
**日付**: ${dateStr}

### 日報内容
${diary.content}
`;
}

/**
 * 複数の日報を一括でまとめたAI評価用Markdownテキストを生成
 */
export function formatMultipleDiariesForAIEvaluation(diaries: Diary[]): string {
  const items = diaries.map((diary, index) => {
    const dateStr = diary.date
      ? new Date(diary.date).toLocaleDateString('ja-JP')
      : new Date(diary.created_at).toLocaleDateString('ja-JP');

    return `### [${index + 1}] ${diary.title} (${dateStr})

${diary.content}
`;
  }).join('\n---\n\n');

  return `# 日報一括評価依頼

以下は過去の日報一覧（計 ${diaries.length} 件）です。全体的な傾向、成長・課題の推移、今後のアクションプランについて総合的に評価・アドバイスをお願いします。

---

${items}
`;
}

/**
 * ブラウザでファイルをダウンロードさせるヘルパー関数
 */
export function downloadFile(content: string, fileName: string, contentType: string = 'text/markdown;charset=utf-8;') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * クリップボードにテキストをコピーするヘルパー関数
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // フォールバック
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
