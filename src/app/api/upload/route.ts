import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { File } from 'buffer';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  const filename = path.basename(file.name);
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
}
