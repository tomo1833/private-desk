import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { Blog } from '@/types/blog';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid blog ID.' }, { status: 400 });
  }
  try {
    const result = runGet<Blog>('SELECT * FROM blog WHERE id = ?', [Number(id)]);
    if (!result) {
      return NextResponse.json({ error: 'blog entry not found.' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch blog entry.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const {
      title,
      content,
      content_markdown,
      content_html,
      eyecatch,
      permalink,
      site,
      author,
      persona,
    } = body;
    if (
      !title ||
      !content ||
      !content_markdown ||
      !content_html ||
      !eyecatch ||
      !permalink ||
      !site ||
      !author ||
      !persona
    ) {
      return NextResponse.json({ error: 'required fields missing.' }, { status: 400 });
    }
    runExecute(
      'UPDATE blog SET title = ?, content = ?, content_markdown = ?, content_html = ?, eyecatch = ?, permalink = ?, site = ?, author = ?, persona = ? WHERE id = ?',
      [
        title,
        content,
        content_markdown,
        content_html,
        eyecatch,
        permalink,
        site,
        author,
        persona,
        Number(id),
      ]
    );
    return NextResponse.json({ message: 'blog entry updated successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update blog entry.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    runExecute('DELETE FROM blog WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'blog entry deleted successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete blog entry.' }, { status: 500 });
  }
}
