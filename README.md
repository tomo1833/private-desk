# Private Desk

## プロジェクト概要

Private Desk は Next.js と SQLite を用いた個人向けデスクトップアプリ風の Web アプリです。
> **このアプリは Raspberry Pi などのローカル環境での個人利用を前提としており、インターネット公開や大規模利用は想定していません。**

## Private Desk の開発方針

- 対象ユーザー：自分自身＋信頼できる家族や仲間（最大でも個人〜数人レベル）
- 使用環境：Raspberry Piや、ノートパソコン（ローカル環境）、インターネット公開は想定しない
- 目的：業務や日常を効率化するための **“個人環境”**
- 配布・公開：GitHubで「参考になれば」レベルのソース公開はOK。ユーザーサポートや責任は負わない


### 主な機能

- **パスワード管理** – Web サイトのログイン情報を登録し、一覧表示や編集、クリップボードへのコピーが可能
- **Wiki/日報** – Markdown でメモや日報を残し、一覧表示や編集・削除が可能
- **ブログ管理** – アイキャッチ画像のアップロードやローカル LLM(Ollama) を用いた本文生成機能付き
- **ファイル管理** – `public/docs` 以下のファイル/フォルダをブラウザからアップロード・作成
- **予定表** – FullCalendar を利用したスケジュール管理。Google カレンダーとの同期にも対応
- **家計簿** – 月別・日別の支出を簡易的に記録
- **検索** – 上記のパスワード、Wiki、日報、ブログをまとめて全文検索

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
3. .env ファイルの作成
   `.env.example` をコピーして `.env` を作成し、必要に応じて Ollama のホストとポートを設定します。

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

## DATABASE テーブル構成

下記の `scripts/init-db.ts` でテーブルを作成しています。主な構造は次の通りです。

```sql
CREATE TABLE password_manager (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_name TEXT NOT NULL,
  site_url  TEXT NOT NULL,
  login_id  TEXT,
  password  TEXT NOT NULL,
  email     TEXT,
  memo      TEXT,
  category  TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wiki (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  content_html TEXT NOT NULL,
  eyecatch TEXT NOT NULL,
  permalink TEXT NOT NULL,
  site TEXT NOT NULL,
  author TEXT NOT NULL,
  persona TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE author (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  bio TEXT
);

CREATE TABLE persona (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  start TEXT NOT NULL,
  end TEXT NOT NULL,
  memo TEXT,
  google_event_id TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  shop TEXT NOT NULL,
  product_name TEXT,
  remark TEXT,
  used_at TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Ollama 連携

ブログ生成機能ではローカルLLMである [Ollama](https://ollama.ai/) を利用します。
`.env` に以下の環境変数を設定してホストとポートを指定してください。

```bash
OLLAMA_HOST=localhost
OLLAMA_PORT=11434
```

## Google カレンダー連携

予定表機能では Google カレンダーと同期できます。サービスアカウントを用意し、`.env` に以下の変数を設定してください。

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
```

## Blogger 取り込み

Google Blogger API を利用して既存の `blog` テーブルへ記事を取り込むには、
画面の「Blogger同期」ボタンまたは `scripts/import-blogger.ts` スクリプトを使用します。
`.env` に以下の変数を設定した後、ページ上のボタンを押すか、次のコマンドを実行してください。

```bash
npx ts-node scripts/import-blogger.ts
```

```
BLOGGER_API_KEY=your-google-api-key
BLOGGER_BLOG_ID=1234567890123456789
```

アイキャッチ画像にはダミー URL を使用し、著者とペルソナは固定文字列で登録されます。


## ブログエディタのHTMLモード例

`BlogEditor` では右上のボタンでリッチテキストとHTMLを切り替えられます。HTMLモードにした状態で、以下のように`<ol>`を`<div>`で包んだHTMLを直接入力すると、そのまま`content_html`に保存されます。

```html
<div class="table-of-contents">
  <ol>
    <li>項目1</li>
    <li>項目2</li>
  </ol>
</div>
```

リッチテキストモードへ戻すとTipTapが`<div>`を削除してしまうため、このようなネスト構造を保持したい場合はHTMLモードで編集したまま保存してください。
