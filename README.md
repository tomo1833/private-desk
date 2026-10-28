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
- **検索** – 上記のパスワード、Wiki、日報、ブログをまとめて部分一致検索
- **ほしいもの** – 買いたい物を優先度・予算つきで管理し、一覧の検索・並べ替えに対応
- **ホーム** – 最新の日記と、各機能へのクイックアクションを表示するダッシュボード

### テーマ

既定はライトテーマ（青灰色の背景・白いカード・落ち着いたブルーのアクセント）です。ヘッダーのテーマ切替でダークテーマ（チャコール系）に変更でき、選択はブラウザの `localStorage`（`theme`）に保存されます。詳細は [docs/design-system.md](docs/design-system.md) を参照してください。

## 前提条件

- Node.js `^24.22.1 || >=26.12.1`（`package.json` の `engines.node` に準拠）
- npm または同等のパッケージマネージャー

## セットアップ手順

1. 依存関係のインストール
   ```bash
   npm install
   ```
2. `.env.example` を `.env` にコピーし、`DATABASE_URL` を確認します。
   ```powershell
   Copy-Item .env.example .env
   ```
3. データベースの初期化・更新
   ```bash
   npx prisma migrate deploy
   ```
   `.env.example` の接続先では `data/database.sqlite` が作成されます。必要に応じて Ollama のホストとポートも設定してください。
4. アプリ認証用の秘密値を設定します。各コマンドの出力をそれぞれ `.env` に設定し、`APP_AUTH_SECRET` と `APP_AUTH_SETUP_TOKEN` には異なる値を使用してください。
   ```powershell
   # APP_AUTH_SECRET
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   # APP_AUTH_SETUP_TOKEN
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```
   `APP_AUTH_SECRET` はセッション署名に使うため、ログイン済みの間は変更しないでください。`APP_AUTH_SETUP_TOKEN` は初回設定後に `.env` から削除してください。
5. サーバーを起動し、`/setup` で設定トークンと16文字以上の管理者パスワードを入力します。設定後、`/login` からログインしてください。

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

プロジェクトには Jest を利用した簡単なテストが含まれています。以下のコマンド
でテストを実行できます（`npm test` はコンポーネント/スタイル/アクセシビリティ向け）。

```bash
npm test
```

API テストのみ実行する場合:

```bash
npm run test:api
```

## 注意点

- アプリ全体のページとAPIは管理者ログインで保護されます。初回設定は `.env` に設定した一度限りのトークンを必要とし、管理者パスワードの検証値はscryptで導出してDBに保存します。セッションCookieはHttpOnly・SameSite Strictで、8時間で期限切れになります。セッションのハッシュをDBで管理し、ログアウトすると現在のセッションを個別に失効させます。
- 本番モードでは認証Cookieに`Secure`属性が付くため、HTTPSでないとログインできません（`localhost`を除く）。HTTPS化していないLAN内でHTTPアクセスする場合に限り、`.env`に`APP_AUTH_COOKIE_SECURE=false`を設定して再起動してください。Cookieが平文で送信されるため、信頼できるLAN内に限定し、可能ならHTTPS（リバースプロキシ）を使ってください。
- ログインはアプリプロセス全体で、失敗が5回に達すると15分間拒否します。拒否中の応答はHTTP 429と `Retry-After` を返し、ログイン成功時に失敗回数をリセットします。SQLite・単一プロセス前提のメモリ内制限のため、サーバー再起動で状態が消えます。再起動後も継続する制限や複数プロセス環境では、共有ストアまたはリバースプロキシ側の制限を追加してください。この全体制限は1人が失敗を重ねても他のログインを一時的に妨げる可能性があります。
- 既存データベースにアプリ認証・セッション管理用テーブルを追加するため、更新前にDBをバックアップし、`npx prisma migrate deploy` を実行してください。`APP_AUTH_SECRET` を紛失・変更すると既存セッションは無効になります。管理者パスワードを忘れた場合のアプリ内リセット機能はありません。
- これは単一管理者・単一アプリプロセスを前提とした基本的なアクセス制御です。インターネットから直接公開できることを意味しません。外出先からの利用はVPNを推奨します。公開を検討する場合も、HTTPSリバースプロキシ、永続・共有レート制限、ファイアウォール、更新運用を別途構成・検証してください。複数プロセスやサーバーレス環境ではセッション検証とレート制限の共有を含め、別途設計が必要です。
- アプリ認証はページ、API、`public/docs`への通常のHTTPリクエストに適用されます。`/_next` のビルドアセットはログイン画面表示のため例外です。SQLiteファイルやバックアップをWeb公開ディレクトリに置かないでください。
- ファイル管理APIは`public/docs`内の既存ディレクトリだけを対象とし、親ディレクトリへの移動やシンボリックリンク経由のアクセスを拒否します。アップロードは1ファイル10 MBまでで、同名ファイルは上書きしません。
- パスワード管理は初回に12文字以上のマスターパスワードを設定します。保管庫内のパスワードは AES-256-GCM で暗号化され、一覧表示では秘密の値を取得せず、個別にコピーする際に取得します。未認証ではパスワードAPI、統合検索API、SQL APIを利用できません。
- 初回は信頼できるローカル環境から `/passwords` を開き、他サービスで使い回していない長いマスターパスワードを設定してください。既存のパスワード行があれば、初回設定時に暗号化されます。設定前にDBのバックアップを取り、そのバックアップも暗号化してください。
- マスターパスワードを忘れると保存したパスワードは復号できません。安全な場所に保管してください。マスターパスワード自体は復元できません。
- 暗号化対象は保管庫のパスワード欄です。サイト名、URL、ログインID、メールアドレス、メモなどのメタデータは SQLite に平文で保存されます。また、ロック解除中の端末や侵害されたOS・ブラウザーから秘密を守るものではありません。
- 保管庫のセッションは操作が30分ない場合、またはサーバー再起動時にロックされます。
- このアプリはローカル利用を前提としています。HTTPS・認証・アクセス制御を適切に構成せず、インターネットへ公開しないでください。
- データベースファイルはリポジトリ内 `data/` ディレクトリに保存されます。

### DBバックアップの暗号化（Windows）

SQLiteのDBにはパスワード欄以外の情報が平文で含まれます。`data/` はGit管理対象外ですが、それだけではバックアップや端末上のDBを保護できません。DBとバックアップを `public/` などのWeb公開領域に置かず、バックアップは必ず暗号化して保管してください。

1. アプリを停止し、[7-Zip](https://www.7-zip.org/) をインストールします。稼働中のSQLiteファイルをそのままコピーせず、停止してからバックアップしてください。
2. PowerShellで以下を実行します。バックアップ先はリポジトリの外に作成し、パスワードをコマンドに書かず、7-Zipのプロンプトで入力します。

   ```powershell
   $backupDir = Join-Path $env:USERPROFILE 'PrivateDeskBackups'
   New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
   $archive = Join-Path $backupDir ("private-desk-db-{0}.7z" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
   7z a -t7z -mhe=on -p $archive .\data\database.sqlite
   if ($LASTEXITCODE -ne 0) { throw '暗号化バックアップの作成に失敗しました。' }
   7z t $archive
   if ($LASTEXITCODE -ne 0) { throw 'バックアップの検証に失敗しました。' }
   ```

   7-ZipがPATHにない場合は、`7z`をインストール先の`7z.exe`のフルパスに置き換えてください。十分に長く推測されにくい専用パスワードを使用し、アーカイブ内のファイル名も暗号化する`-mhe=on`を外さないでください。パスワードはアーカイブと同じ場所に保存せず、別の安全な手段で保管します。失うとバックアップを復元できません。
3. 作成した`.7z`を別の安全な保存先にも保管する場合は、保存先のアクセス制御と暗号化も確認してください。暗号化前のDBコピーを作らず、作業用の平文ファイルを残さないでください。

復元する際はアプリを停止し、暗号化アーカイブをリポジトリ外の一時フォルダーへ展開してDBを確認してから、`data/database.sqlite`へ戻します。復元後にアプリを起動してデータを確認し、一時フォルダーに展開した平文DBを安全に削除してください。バックアップは定期的に作成し、復元可能かを定期的に検証してください。

## MCP: 統合検索・要約エージェントの使い方

### 1) 事前準備

- `.env` に `DATABASE_URL` を設定したうえで `npx prisma migrate deploy` を実行してください。
- Ollama を起動し、`.env` にホストとポートを設定します。

```
OLLAMA_HOST=localhost
OLLAMA_PORT=11434
```

### 2) 画面から使う

1. `/search?q=任意の検索語` にアクセスします。
2. 「MCP 要約」パネルの「要約生成」ボタンを押すと、検索結果の要約が表示されます。

### 3) API から使う

- エンドポイント: `GET /api/mcp/search-summary`
- クエリ:
  - `q` (必須): 検索語
  - `limit` (任意): 各テーブルから取得する件数。未指定時は 5。
  - `model` (任意): Ollama のモデル名。未指定時は `Gemma3:12b`。
  - `llm` (任意): `0` を指定すると LLM を使わずにローカル要約を返します。

例:

```bash
curl "http://localhost:3000/api/mcp/search-summary?q=日報&limit=3"
```

LLM を使わない例:

```bash
curl "http://localhost:3000/api/mcp/search-summary?q=日報&limit=3&llm=0"
```

レスポンス例:

```json
{
  "summary": "- ...",
  "context": "...",
  "sources": {
    "passwords": [],
    "diaries": [],
    "wikis": [],
    "blogs": []
  }
}
```


## Prisma/SQLite

本プロジェクトは Prisma を利用して SQLite にアクセスします。接続先は `.env` の `DATABASE_URL` で設定します。将来的に別 ORM への移行を検討する場合は `docs/async-sqlite-migration.md` を参照してください。

## DATABASE テーブル構成

データベースのテーブルは `prisma/migrations/` のマイグレーションで管理しています。主な構造は次の通りです。

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
  used_by TEXT,
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

### Blogger リストのエクスポート

取り込んだ記事を Excel ファイルへ書き出す場合は、次のコマンドを実行してください。

```bash
npx ts-node scripts/export-blogger.ts
```

`blogger_list.xlsx` が生成され、HTML タグを除いた本文が保存されます。

ブログ一覧ページの「Bloggerエクスポート」ボタンからも同じファイルをダウンロードできます。


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
