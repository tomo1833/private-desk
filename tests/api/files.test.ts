import { GET, POST as CREATE } from '../../src/app/api/files/route';
import { POST as UPLOAD } from '../../src/app/api/files/upload/route';
import fs from 'fs/promises';
import path from 'path';

const docsRoot = path.join(process.cwd(), 'public', 'docs');

describe('File API', () => {
  const folder = 'jest-folder';

  afterAll(async () => {
    await fs.rm(path.join(docsRoot, folder), { recursive: true, force: true });
  });

  it('should list files', async () => {
    const req = new Request('http://localhost/api/files');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should create folder and upload file', async () => {
    const createReq = new Request('http://localhost/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '', name: folder }),
    });
    const createRes = await CREATE(createReq as any);
    expect(createRes.status).toBe(200);

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const fd = new FormData();
    fd.append('file', file);
    fd.append('path', folder);
    const uploadReq = new Request('http://localhost/api/files/upload', {
      method: 'POST',
      body: fd,
    });
    const uploadRes = await UPLOAD(uploadReq as any);
    expect(uploadRes.status).toBe(200);
    const { url } = await uploadRes.json();
    const filePath = path.join(process.cwd(), 'public', url.replace(/^\//, ''));
    const exists = await fs
      .stat(filePath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
  });
});
