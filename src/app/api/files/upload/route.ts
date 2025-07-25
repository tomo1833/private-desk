import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
// Node 18 and later expose a File implementation via the `buffer` module.
// Explicitly importing it ensures compatibility when the global `File`
// class is not automatically available (e.g. on older Node versions).
import { File } from 'buffer';

const docsRoot = path.join(process.cwd(), 'public', 'docs');

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const relPath = (formData.get('path') as string) || '';
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await fs.mkdir(path.join(docsRoot, relPath), { recursive: true });
  const filename = path.basename(file.name);
  await fs.writeFile(path.join(docsRoot, relPath, filename), buffer);
  const url = `/docs/${relPath ? relPath + '/' : ''}${filename}`;
  return NextResponse.json({ url });
}
