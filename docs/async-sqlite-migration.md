# 非同期 SQLite ライブラリ/ORM の調査と移行ステップ

このドキュメントでは、`better-sqlite3` を使用した同期的なデータベースアクセスを、非同期に対応したライブラリや ORM へ移行する際の検討事項をまとめます。

## 候補となるライブラリ/ORM

| 名前 | 特徴 | 公式サイト |
| --- | --- | --- |
| [sqlite3](https://www.npmjs.com/package/sqlite3) | Node.js 標準に近い API を持つ非同期ライブラリ。コールバック／Promise 対応。 | <https://github.com/TryGhost/node-sqlite3> |
| [Prisma](https://www.prisma.io/) | 型安全な ORM。CLI を用いたマイグレーション管理や生成された型により開発効率が高い。 | <https://www.prisma.io/> |
| [TypeORM](https://typeorm.io/) | デコレーターを用いたエンティティ定義が可能な ORM。SQLite を含む複数 DB をサポート。 | <https://typeorm.io/> |
| [Drizzle ORM](https://orm.drizzle.team/) | SQL ライクな型安全クエリを提供する軽量 ORM。Next.js との相性が良い。 | <https://orm.drizzle.team/> |

上記以外にも `knex` などのクエリビルダーがありますが、本プロジェクトでは簡潔さと型安全を重視し、`Prisma` または `Drizzle ORM` の採用を検討することが多いです。

## 移行ステップ例 (Prisma を用いる場合)

1. **依存関係の追加**
   ```bash
   npm install prisma @prisma/client
   npx prisma init --datasource-provider sqlite
   ```
   これにより `prisma/schema.prisma` が生成されます。

2. **既存スキーマの反映**
   `scripts/init-db.ts` で定義されているテーブル構造を `schema.prisma` に移します。たとえば以下のように定義します。
   ```prisma
   model password_manager {
     id         Int      @id @default(autoincrement())
     site_name  String
     site_url   String
     login_id   String?
     password   String
     email      String?
     memo       String?
     category   String?
     created_at DateTime @default(now())
     updated_at DateTime @updatedAt
   }
   ```

3. **マイグレーションの実行**
   ```bash
   npx prisma migrate dev --name init
   ```
   これによりデータベースファイルが生成され、Prisma クライアントが構築されます。

4. **データアクセス層の書き換え**
   `src/lib/db.ts` の関数を Prisma クライアントを利用した実装に置き換えます。すべて非同期処理となるため、API ルートやサーバーコンポーネント側で `await` を使用するように変更します。

5. **既存 API ルートの更新**
   `src/app/api/**` で `runSelect`, `runGet`, `runExecute` を呼び出している箇所を、Prisma クライアントによるクエリに置き換えます。エラーハンドリングは現在と同様、`try/catch` で行います。

6. **スクリプトの調整**
   `scripts/init-db.ts` の役割は Prisma マイグレーションに置き換えられるため、不要であれば削除するか、マイグレーション実行用スクリプトに変更します。

7. **テストと動作確認**
   `npm run dev` でアプリを起動し、登録・更新・取得が行えることを確認します。データベースファイルの構造が変わるため、既存データを移行する場合はバックアップを取ってから作業してください。

## 移行ステップ例 (Drizzle ORM を用いる場合)

1. **依存関係の追加**
   ```bash
   npm install drizzle-orm better-sqlite3
   ```
   Drizzle はドライバとして `better-sqlite3` をそのまま使用できますが、非同期版を利用する場合は `drizzle-kit` や `@drizzle-orm/better-sqlite3` を組み合わせます。

2. **スキーマファイルの作成**
   `drizzle` ディレクトリを作成し、テーブル定義を記述します。
   ```ts
   // drizzle/schema.ts
   import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

   export const passwordManager = sqliteTable('password_manager', {
     id: integer('id').primaryKey({ autoIncrement: true }),
     siteName: text('site_name').notNull(),
     siteUrl: text('site_url').notNull(),
     loginId: text('login_id'),
     password: text('password').notNull(),
     email: text('email'),
     memo: text('memo'),
     category: text('category'),
     createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
     updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
   });
   ```

3. **マイグレーションの生成と実行**
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit up
   ```

4. **データアクセス層の書き換え**
   Drizzle のクエリビルダーを利用して各 API ルートの処理を実装します。Promise ベースのため `await` が必要です。

5. **動作確認**
   Prisma 同様に `npm run dev` で確認します。

## まとめ

- 小規模かつ単純な CRUD であれば、軽量な `sqlite3` だけで移行することも可能ですが、型安全やマイグレーション管理を重視する場合は ORM 導入がおすすめです。
- Prisma はリッチな機能と広いコミュニティが魅力で、学習コストはやや高めですが長期的な保守性を得られます。
- Drizzle ORM はモダンな TypeScript プロジェクトに適した軽量 ORM で、Next.js との相性も良好です。
- どのライブラリを採用する場合でも、非同期 API となるため `async/await` を中心としたコードに書き換える必要があります。

