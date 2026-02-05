import { NextResponse } from 'next/server';
import { runSelect } from '@/lib/db';
import type { Password } from '@/types/password';
import type { Diary } from '@/types/diary';
import type { Wiki } from '@/types/wiki';
import type { Blog } from '@/types/blog';

const MAX_SNIPPET_LENGTH = 320;
const DEFAULT_LIMIT = 5;

const clipText = (text: string) => {
  if (text.length <= MAX_SNIPPET_LENGTH) return text;
  return `${text.slice(0, MAX_SNIPPET_LENGTH)}...`;
};

const formatList = (label: string, items: string[]) => {
  if (items.length === 0) return `${label}: 該当なし`;
  return `${label}:\n${items.map((item) => `- ${item}`).join('\n')}`;
};

const buildLocalSummary = (
  label: string,
  items: string[],
  emptyMessage: string
) => {
  if (items.length === 0) return `- ${label}: ${emptyMessage}`;
  const names = items.slice(0, 3).join(', ');
  const suffix = items.length > 3 ? ` ほか${items.length - 3}件` : '';
  return `- ${label}: ${items.length}件 (${names}${suffix})`;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const limit = Number(searchParams.get('limit') ?? DEFAULT_LIMIT);
  const model = searchParams.get('model') ?? 'Gemma3:12b';
  const useLLM = searchParams.get('llm') !== '0';

  if (!q) {
    return NextResponse.json({ error: 'query required' }, { status: 400 });
  }

  const like = `%${q}%`;

  try {
    const passwords = runSelect<Password>(
      'SELECT * FROM password_manager WHERE site_name LIKE ? OR site_url LIKE ? OR login_id LIKE ? OR email LIKE ? OR memo LIKE ? ORDER BY updated_at DESC LIMIT ?',
      [like, like, like, like, like, limit]
    );
    const diaries = runSelect<Diary>(
      'SELECT * FROM diary WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC LIMIT ?',
      [like, like, limit]
    );
    const wikis = runSelect<Wiki>(
      'SELECT * FROM wiki WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC LIMIT ?',
      [like, like, limit]
    );
    const blogs = runSelect<Blog>(
      'SELECT * FROM blog WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC LIMIT ?',
      [like, like, limit]
    );

    const passwordLines = passwords.map(
      (item) =>
        `${item.site_name} (${item.site_url}) メモ: ${clipText(item.memo ?? '')}`.trim()
    );
    const diaryLines = diaries.map(
      (item) => `${item.title} - ${clipText(item.content)}`
    );
    const wikiLines = wikis.map(
      (item) => `${item.title} - ${clipText(item.content)}`
    );
    const blogLines = blogs.map(
      (item) => `${item.title} - ${clipText(item.content)}`
    );

    const context = [
      formatList('パスワード管理', passwordLines),
      formatList('日報', diaryLines),
      formatList('Wiki', wikiLines),
      formatList('ブログ', blogLines),
    ].join('\n\n');

    if (!useLLM) {
      const summary = [
        buildLocalSummary('パスワード', passwords.map((item) => item.site_name), '該当なし'),
        buildLocalSummary('日報', diaries.map((item) => item.title), '該当なし'),
        buildLocalSummary('Wiki', wikis.map((item) => item.title), '該当なし'),
        buildLocalSummary('ブログ', blogs.map((item) => item.title), '該当なし'),
      ].join('\n');

      return NextResponse.json({
        summary,
        context,
        sources: {
          passwords,
          diaries,
          wikis,
          blogs,
        },
      });
    }

    const prompt = `あなたはPrivate Deskの統合検索アシスタントです。
ユーザーの検索クエリに対して、以下のデータを参照しながら要約を作成してください。
要約は日本語で、3〜6行程度で重要ポイントを箇条書きにしてください。
該当情報が少ない場合は「該当なし」と明記してください。

検索クエリ: ${q}

データ:
${context}
`;

    const host = process.env.OLLAMA_HOST || 'localhost';
    const port = process.env.OLLAMA_PORT || '11434';
    const res = await fetch(`http://${host}:${port}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'LLM request failed' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({
      summary: data.response ?? data.output ?? '',
      context,
      sources: {
        passwords,
        diaries,
        wikis,
        blogs,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '要約生成に失敗しました' }, { status: 500 });
  }
}
