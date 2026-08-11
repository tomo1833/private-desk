import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DiaryListPage from '@/app/diaries/page';

// Global mocks
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ id: '1' }),
}));

jest.mock('@/app/components/MarkdownRenderer', () => {
  return function MockMarkdown({ children }: { children: string }) {
    return <div>{children}</div>;
  };
});

const mockCopyToClipboard = jest.fn().mockResolvedValue(true);
const mockDownloadFile = jest.fn();

jest.mock('@/lib/diaryExport', () => ({
  ...jest.requireActual('@/lib/diaryExport'),
  copyToClipboard: (...args: any[]) => mockCopyToClipboard(...args),
  downloadFile: (...args: any[]) => mockDownloadFile(...args),
}));

describe('DiaryListPage Bulk Export UI', () => {
  const mockDiaries = [
    {
      id: 1,
      title: 'テスト日報1',
      content: '内容はテスト1です',
      date: '2026-08-10',
      display_order: 0,
      created_at: '2026-08-10T00:00:00Z',
    },
    {
      id: 2,
      title: 'テスト日報2',
      content: '内容はテスト2です',
      date: '2026-08-11',
      display_order: 1,
      created_at: '2026-08-11T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDiaries,
    } as any);
  });

  it('renders bulk export buttons and triggers copy action', async () => {
    render(<DiaryListPage />);

    await waitFor(() => {
      expect(screen.getByText('全 2 件の日報が登録されています')).toBeInTheDocument();
    });

    const copyBtn = screen.getByText('全件AI評価コピー');
    expect(copyBtn).toBeInTheDocument();

    fireEvent.click(copyBtn);

    expect(mockCopyToClipboard).toHaveBeenCalledTimes(1);
  });
});
