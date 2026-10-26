export interface AppFeature {
  href: string;
  icon: string;
  name: string;
  description: string;
  keywords?: string;
  badge?: string;
}

export interface AppFeatureGroup {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: AppFeature[];
}

export const APP_FEATURE_GROUPS: AppFeatureGroup[] = [
  {
    id: 'knowledge',
    title: '記録・ナレッジ',
    description: '日々の記録や、あとから活用する知識をまとめます。',
    icon: '✍️',
    features: [
      { href: '/diaries', icon: '📔', name: '日記・日報', description: '日々の記録と振り返り', keywords: '日誌 diary journal' },
      { href: '/wikis', icon: '📝', name: 'Wiki', description: 'ナレッジやメモを蓄積', keywords: '知識 メモ' },
      { href: '/blogs', icon: '✍️', name: 'ブログ', description: '記事の編集・AI生成', keywords: '文章 執筆 AI', badge: 'AI' },
      { href: '/narous', icon: '📖', name: 'なろう小説', description: '小説の閲覧・感想記録', keywords: '読書 小説' },
      { href: '/authors', icon: '👤', name: '著者', description: '執筆者プロフィール', keywords: '作家' },
      { href: '/personas', icon: '🎭', name: 'ペルソナ', description: 'キャラクター設定', keywords: '人物 キャラクター' },
    ],
  },
  {
    id: 'learning',
    title: 'エンタメ・学び',
    description: '観たもの、読んだもの、学んだことを記録します。',
    icon: '🎬',
    features: [
      { href: '/animes', icon: '🎬', name: 'アニメ', description: '視聴状況・評価', keywords: 'アニメーション' },
      { href: '/books', icon: '📚', name: '本', description: '読書ログ・要約', keywords: '読書 書籍' },
      { href: '/movies', icon: '🎞️', name: '映画', description: '映画レビュー・記録', keywords: 'ムービー' },
      { href: '/musics', icon: '🎵', name: '音楽', description: 'アルバムや曲のメモ', keywords: 'ミュージック' },
      { href: '/udemys', icon: '🎓', name: 'Udemy', description: 'オンライン講座の進捗', keywords: '学習 講座' },
    ],
  },
  {
    id: 'management',
    title: '暮らし・管理',
    description: 'お金、予定、持ち物、プロジェクトを管理します。',
    icon: '🧭',
    features: [
      { href: '/expenses', icon: '💰', name: '家計簿', description: '支出の記録・統計', keywords: 'お金 費用' },
      { href: '/schedule', icon: '📅', name: 'カレンダー', description: '予定表・Google同期', keywords: 'スケジュール 予定' },
      { href: '/wbs', icon: '📊', name: 'プロジェクト', description: 'WBS・ガントチャート', keywords: 'タスク 工程表', badge: 'WBS' },
      { href: '/wishlists', icon: '🎁', name: 'ほしいもの', description: '候補・優先度・予算', keywords: '買い物 欲しい' },
      { href: '/subscriptions', icon: '💻', name: 'サブスク', description: '定額サービス・ライセンス', keywords: '定期 支払い' },
      { href: '/stocks', icon: '📈', name: '日本株', description: '保有株・評価額', keywords: '株式 投資' },
      { href: '/files', icon: '📁', name: 'ファイル', description: 'ドキュメント・添付', keywords: '資料 書類' },
      { href: '/passwords', icon: '🔐', name: 'パスワード', description: 'ログイン情報の管理', keywords: '資格情報 アカウント' },
      { href: '/sql', icon: '🛠️', name: 'SQLツール', description: 'データベース管理', keywords: 'データベース' },
    ],
  },
];

export const QUICK_ACTIONS = [
  {
    href: '/diaries/new',
    icon: '✍️',
    title: '日記を書く',
    description: '今日の出来事を記録',
    primary: true,
  },
  {
    href: '/schedule',
    icon: '📅',
    title: '予定を確認',
    description: 'カレンダーを開く',
    primary: false,
  },
  {
    href: '/wikis/new',
    icon: '📝',
    title: 'Wikiを追加',
    description: '知識やアイデアを残す',
    primary: false,
  },
  {
    href: '/expenses/new',
    icon: '💰',
    title: '支出を記録',
    description: '家計簿に追加する',
    primary: false,
  },
];
