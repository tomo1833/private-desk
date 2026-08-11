import { formatDiaryForAIEvaluation, formatMultipleDiariesForAIEvaluation } from '@/lib/diaryExport';
import type { Diary } from '@/types/diary';

describe('diaryExport utility', () => {
  const mockDiary: Diary = {
    id: 1,
    title: '本日の開発進捗',
    content: 'Reactのコンポーネントをリファクタリングした。',
    date: '2026-08-12',
    display_order: 0,
    created_at: '2026-08-12T00:00:00Z',
  };

  const mockDiary2: Diary = {
    id: 2,
    title: 'UIデザインの修正',
    content: 'ダークモードのアクセシビリティを改善。',
    date: '2026-08-11',
    display_order: 1,
    created_at: '2026-08-11T00:00:00Z',
  };

  it('formatDiaryForAIEvaluation formats a single diary into Markdown prompt', () => {
    const result = formatDiaryForAIEvaluation(mockDiary);
    expect(result).toContain('# 日報評価依頼');
    expect(result).toContain('## タイトル: 本日の開発進捗');
    expect(result).toContain('Reactのコンポーネントをリファクタリングした。');
  });

  it('formatMultipleDiariesForAIEvaluation formats multiple diaries into combined prompt', () => {
    const result = formatMultipleDiariesForAIEvaluation([mockDiary, mockDiary2]);
    expect(result).toContain('# 日報一括評価依頼');
    expect(result).toContain('計 2 件');
    expect(result).toContain('### [1] 本日の開発進捗');
    expect(result).toContain('### [2] UIデザインの修正');
  });
});
