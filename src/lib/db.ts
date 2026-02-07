import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data/database.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const url = process.env.DATABASE_URL ?? `file:${dbPath}`;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 複数レコードを取得
export async function runSelect<T>(
  sql: string,
  params: (string | number | null)[] = []
): Promise<T[]> {
  const rows = await prisma.$queryRawUnsafe<T[]>(sql, ...params);
  return rows ?? [];
}

// 単一レコードを取得
export async function runGet<T>(
  sql: string,
  params: (string | number | null)[] = []
): Promise<T | undefined> {
  const rows = await runSelect<T>(sql, params);
  return rows[0];
}

// 更新・挿入・削除（戻り値なし）
export async function runExecute(
  sql: string,
  params: (string | number | null)[] = []
): Promise<void> {
  await prisma.$executeRawUnsafe(sql, ...params);
}

export default prisma;
