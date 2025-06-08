import Database from 'better-sqlite3';
import path from 'path';

// データベースファイルのパスを解決
const dbPath = path.resolve(process.cwd(), 'data/database.sqlite');

// データベース接続（同期的）
const db = new Database(dbPath);

// 複数レコードを取得
export function runSelect<T>(sql: string, params: (string | number | null)[] = []): T[] {
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
}

// 単一レコードを取得
export function runGet<T>(sql: string, params: (string | number | null)[] = []): T | undefined {
  const stmt = db.prepare(sql);
  return stmt.get(...params) as T | undefined;
}

// 更新・挿入・削除（戻り値なし）
export function runExecute(sql: string, params: (string | number | null)[] = []): void {
  const stmt = db.prepare(sql);
  stmt.run(...params);
}

export default db;