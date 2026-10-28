import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import {
  createDocsDirectory,
  DocsStorageError,
  resolveDocsDirectory,
} from '@/lib/docsStorage';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const relPath = searchParams.get('path') || '';
  try {
    const { directory: target } = await resolveDocsDirectory(relPath);
    const items = await fs.readdir(target, { withFileTypes: true });
    const entries = items.map((d) => ({ name: d.name, isDirectory: d.isDirectory() }));
    return NextResponse.json(entries);
  } catch (error) {
    if (error instanceof DocsStorageError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Directory not found.' }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await createDocsDirectory(body.path ?? '', body.name);
    return NextResponse.json({ message: 'folder created' });
  } catch (error) {
    if (error instanceof DocsStorageError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
