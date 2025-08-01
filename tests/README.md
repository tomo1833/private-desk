# テストドキュメント

このプロジェクトのテストスイートについて説明します。

## テスト構成

### コンポーネントテスト
- **場所**: `tests/components/`
- **目的**: React コンポーネントの動作とレンダリングをテスト
- **環境**: jsdom (ブラウザ環境をシミュレート)

### APIテスト
- **場所**: `tests/api/`
- **目的**: Next.js API ルートの動作をテスト
- **環境**: node (サーバー環境)

### スタイル/アニメーションテスト
- **場所**: `tests/styles/`
- **目的**: CSS クラス、アニメーション、スタイリングをテスト
- **環境**: jsdom

### アクセシビリティテスト
- **場所**: `tests/accessibility/`
- **目的**: WAI-ARIA ガイドラインに基づくアクセシビリティをテスト
- **環境**: jsdom + axe-core

## テスト実行コマンド

### 基本コマンド
```bash
# すべてのテストを実行
npm test

# コンポーネントテストのみ
npm run test:components

# APIテストのみ
npm run test:api

# すべてのテストを順次実行
npm run test:all

# ウォッチモードでコンポーネントテスト
npm run test:watch

# カバレッジレポート付きでテスト実行
npm run test:coverage
```

## テスト対象

### 改善されたデザインのテスト

#### レイアウト (Layout.test.tsx)
- ガラスモーフィズムスタイリング
- ヘッダー・フッターの構造
- 検索機能のアクセシビリティ
- テーマトグル機能

#### メインページ (MainPage.test.tsx)
- 支出サマリーカードのスタイリング
- アクションボタンのアイコンとスタイル
- セクション構造とカードレイアウト
- データ読み込み・エラーハンドリング
- レスポンシブデザイン

#### CSS・アニメーション (animations.test.ts)
- キーフレームアニメーションの存在確認
- ガラスモーフィズムクラスの動作
- ホバー効果とトランジション
- レスポンシブクラス
- カラー一貫性

#### アクセシビリティ (design-accessibility.test.tsx)
- WCAG ガイドライン準拠
- セマンティックHTML構造
- キーボードナビゲーション
- スクリーンリーダー対応
- カラーコントラスト
- アニメーションの配慮

## モックとセットアップ

### グローバルセットアップ (setup.ts)
- Next.js ルーター・Link・Image のモック
- fetch API のモック
- matchMedia、ResizeObserver のモック
- Jest DOM マッチャーの設定

### コンポーネントモック
- 各テストファイルで必要に応じてコンポーネントをモック
- アクセシビリティ属性を含む適切なモック実装

## 品質指標

### カバレッジ目標
- コンポーネント: 80%以上
- API: 85%以上
- 新しいデザイン関連コード: 90%以上

### テスト種類
- 単体テスト: 個別コンポーネント・関数
- 統合テスト: コンポーネント間の連携
- アクセシビリティテスト: a11y ガイドライン準拠
- ビジュアル回帰テスト: スタイリングの一貫性

## 継続的インテグレーション

テストは以下のタイミングで自動実行されます：
- Pull Request 作成・更新時
- メインブランチへのマージ時
- デプロイ前の検証

## 新しいテストの追加

### コンポーネントテスト追加時
1. `tests/components/` にテストファイルを作成
2. 必要なモックを設定
3. レンダリング・動作・アクセシビリティをテスト

### APIテスト追加時
1. `tests/api/` にテストファイルを作成
2. リクエスト・レスポンス・エラーハンドリングをテスト

## トラブルシューティング

### よくある問題
- **Next.js コンポーネントのモックエラー**: `setup.ts` でモック設定を確認
- **非同期テストの失敗**: `waitFor` や適切な待機処理を使用
- **CSS クラステスト**: jsdom の制限を理解し、クラス存在確認でテスト
- **アクセシビリティ違反**: axe-core の詳細レポートを確認

### デバッグ方法
```bash
# 詳細なテスト出力
npm run test:components -- --verbose

# 特定のテストファイルのみ実行
npm run test:components -- Layout.test.tsx

# デバッグモード
node --inspect-brk node_modules/.bin/jest --runInBand
```