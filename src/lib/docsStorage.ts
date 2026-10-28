import { promises as fs } from 'node:fs';
import path from 'node:path';

const docsRoot = path.join(process.cwd(), 'public', 'docs');

export const MAX_DOC_UPLOAD_BYTES = 10 * 1024 * 1024;

export class DocsStorageError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'DocsStorageError';
  }
}

function getPathSegments(value: unknown) {
  if (typeof value !== 'string' || value.includes('\\') || value.includes('\0')) {
    throw new DocsStorageError('Invalid path.', 400);
  }
  if (path.posix.isAbsolute(value)) throw new DocsStorageError('Invalid path.', 400);

  const segments = value.split('/').filter(Boolean);
  if (segments.some((segment) => segment === '.' || segment === '..' || segment.includes(':'))) {
    throw new DocsStorageError('Invalid path.', 400);
  }
  return segments;
}

function getSingleName(value: unknown) {
  if (
    typeof value !== 'string' ||
    !value ||
    value === '.' ||
    value === '..' ||
    value.includes('/') ||
    value.includes('\\') ||
    value.includes('\0') ||
    value.includes(':')
  ) {
    throw new DocsStorageError('Invalid name.', 400);
  }
  return value;
}

function ensureWithinRoot(root: string, target: string) {
  const relativePath = path.relative(root, target);
  if (
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new DocsStorageError('Path is outside the documents directory.', 400);
  }
}

export async function resolveDocsDirectory(relativePath: unknown) {
  const segments = getPathSegments(relativePath);
  await fs.mkdir(docsRoot, { recursive: true });
  const realRoot = await fs.realpath(docsRoot);
  let current = realRoot;

  for (const segment of segments) {
    const next = path.join(current, segment);
    const stat = await fs.lstat(next);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new DocsStorageError('Invalid directory.', 400);
    }
    current = await fs.realpath(next);
    ensureWithinRoot(realRoot, current);
  }

  return { root: realRoot, directory: current };
}

export async function createDocsDirectory(parentPath: unknown, name: unknown) {
  const { directory } = await resolveDocsDirectory(parentPath);
  const safeName = getSingleName(name);
  try {
    await fs.mkdir(path.join(directory, safeName));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') {
      throw new DocsStorageError('A file or folder with that name already exists.', 409);
    }
    throw error;
  }
}

export async function saveDocsUpload(relativePath: unknown, filename: unknown, content: Buffer) {
  const { directory } = await resolveDocsDirectory(relativePath);
  const safeName = getSingleName(filename);
  try {
    await fs.writeFile(path.join(directory, safeName), content, { flag: 'wx' });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') {
      throw new DocsStorageError('A file or folder with that name already exists.', 409);
    }
    throw error;
  }
}
