import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const docsRoot = path.join(process.cwd(), 'public', 'docs');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const relPath = searchParams.get('path') || '';
  const target = path.join(docsRoot, relPath);
  try {
    const items = await fs.readdir(target, { withFileTypes: true });
    const entries = items.map((d) => ({ name: d.name, isDirectory: d.isDirectory() }));
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const relPath: string = body.path || '';
    const name: string = body.name;
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    await fs.mkdir(path.join(docsRoot, relPath, name), { recursive: true });
    return NextResponse.json({ message: 'folder created' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
