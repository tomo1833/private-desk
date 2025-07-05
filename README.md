# Private Desk

## プロジェクト概要

Private Desk は Next.js と SQLite を用いたシンプルなパスワード管理アプリケーションです。ブラウザ上から Web サイトのログイン情報を登録し、一覧表示や編集、パスワードのコピーを行うことができます。

### 主な機能

- サイト名、URL、ログイン ID、パスワード、メールアドレス、メモなどの登録
- 登録済みデータの一覧表示とパスワードのクリップボードコピー
- 各エントリの編集・更新

## 前提条件

- Node.js 18 以上
- npm または同等のパッケージマネージャー

## セットアップ手順

1. 依存関係のインストール
   ```bash
   npm install
   ```
2. データベースの初期化
   ```bash
   npx ts-node scripts/init-db.ts
   ```
   上記コマンドにより `data/database.sqlite` が作成されます。

## 開発サーバの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスして動作を確認できます。

## 本番ビルドと起動

```bash
npm run build
npm start
```

## テストの実行

プロジェクトには Jest を利用した簡単な API テストが含まれています。以下のコマンド
でテストを実行できます。

```bash
npm test
```

## 注意点

- パスワードは暗号化されておらず、SQLite データベースに平文で保存されます。実運用する場合はセキュリティ対策を検討してください。
- データベースファイルはリポジトリ内 `data/` ディレクトリに保存されます。


## 非同期SQLiteへの移行

本プロジェクトは `better-sqlite3` による同期アクセスを採用していますが、非同期ライブラリや ORM への移行を検討する場合は `docs/async-sqlite-migration.md` を参照してください。Prisma や Drizzle ORM といった候補の比較や、移行手順の例をまとめています。

## DATABASEテーブル構成

```
CREATE TABLE diary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

