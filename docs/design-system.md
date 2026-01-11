# デザインシステム

## カードコンポーネント統一ルール

### 基本カード（一覧・詳細）
```tsx
className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-4 sm:p-6"
```

### フォームカード（編集・新規作成）
```tsx
className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl p-8 space-y-6 border border-gray-200 dark:border-gray-700 shadow-lg"
```

## テキスト色

### 見出し
- `text-gray-900 dark:text-white`

### 本文
- `text-gray-700 dark:text-gray-300`

### サブテキスト
- `text-gray-600 dark:text-gray-400`

### ラベル
- `text-gray-900 dark:text-white font-semibold`

## 入力フィールド

### テキスト入力
```tsx
className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
```

## 背景グラデーション

```css
background: linear-gradient(135deg, #4a5568 0%, #2d3748 50%, #1a202c 100%);
```

## ヘッダー・フッター

- 背景: `bg-white/10 backdrop-blur-md`
- テキスト: `text-white`
- ボーダー: `border-gray-200/20`

## 修正が必要なファイル

以下のファイルは旧デザイン(`bg-white/90` + `border-white/40`)を使用しているため、統一が必要：

- [ ] src/app/blogs/page.tsx
- [ ] src/app/wikis/new/page.tsx
- [ ] src/app/wikis/edit/[id]/page.tsx
- [ ] src/app/personas/new/page.tsx
- [ ] src/app/personas/edit/[id]/page.tsx
- [ ] src/app/passwords/new/page.tsx
- [ ] src/app/html-playground/page.tsx
- [ ] src/app/diaries/new/page.tsx
- [ ] src/app/diaries/edit/[id]/page.tsx
- [ ] src/app/expenses/new/page.tsx
- [ ] src/app/expenses/edit/[id]/page.tsx
- [ ] src/app/blogs/new/page.tsx
- [ ] src/app/blogs/edit/[id]/page.tsx
- [ ] src/app/authors/new/page.tsx
- [ ] src/app/authors/edit/[id]/page.tsx
- [ ] src/app/components/PasswordCards.tsx
- [ ] src/app/components/BlogCards.tsx

## 統一完了済み

- [x] src/app/diaries/page.tsx
- [x] src/app/(main)/page.tsx
- [x] src/app/passwords/page.tsx
- [x] src/app/passwords/edit/[id]/page.tsx
- [x] src/app/components/DiaryCards.tsx
- [x] src/app/files/page.tsx
- [x] src/app/sql/page.tsx
- [x] src/app/layout.tsx (header/footer)
- [x] src/app/components/Header.tsx
- [x] src/app/globals.css (background)
