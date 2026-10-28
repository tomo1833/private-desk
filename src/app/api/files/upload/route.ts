import { NextResponse } from 'next/server';
import { File } from 'buffer';
import {
  DocsStorageError,
  MAX_DOC_UPLOAD_BYTES,
  saveDocsUpload,
} from '@/lib/docsStorage';

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length'));
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_DOC_UPLOAD_BYTES + 1024 * 1024
  ) {
    return NextResponse.json({ error: 'File exceeds the 10 MB upload limit.' }, { status: 413 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const relPath = formData.get('path') ?? '';
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }
    if (file.size > MAX_DOC_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'File exceeds the 10 MB upload limit.' },
        { status: 413 }
      );
    }

    await saveDocsUpload(relPath, file.name, Buffer.from(await file.arrayBuffer()));
    const urlSegments = [
      ...(typeof relPath === 'string' && relPath ? relPath.split('/') : []),
      file.name,
    ];
    return NextResponse.json({ url: `/docs/${urlSegments.map(encodeURIComponent).join('/')}` });
  } catch (error) {
    if (error instanceof DocsStorageError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Failed to upload document:', error);
    return NextResponse.json({ error: 'File upload failed.' }, { status: 500 });
  }
}
