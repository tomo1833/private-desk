import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewDiaryPage from '@/app/diaries/new/page';

// Mock next/navigation
const mockPush = jest.fn();
let mockSearchParamsGet = jest.fn().mockReturnValue(null);

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParamsGet(key),
  }),
}));

describe('NewDiaryPage Copy Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParamsGet = jest.fn().mockReturnValue(null);
    (global as any).fetch = jest.fn();
  });

  it('renders copy button on NewDiaryPage', () => {
    render(<NewDiaryPage />);
    expect(screen.getByText('前回の（昨日の）日報をコピー')).toBeInTheDocument();
  });

  it('fetches latest diary and populates form when copy button is clicked', async () => {
    const mockLatestDiary = [
      {
        id: 1,
        title: '昨日の日報タイトル',
        content: '昨日の日報本文テキスト',
        date: '2026-08-11T00:00:00.000Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLatestDiary,
    });

    render(<NewDiaryPage />);

    const copyBtn = screen.getByText('前回の（昨日の）日報をコピー');
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/diary?limit=1');
      expect((screen.getByLabelText('タイトル') as HTMLInputElement).value).toBe('昨日の日報タイトル');
      expect((screen.getByLabelText('内容') as HTMLTextAreaElement).value).toBe('昨日の日報本文テキスト');
      expect(screen.getByText('直近の日報から内容をコピーしました')).toBeInTheDocument();
    });
  });

  it('fetches specific diary when copyFrom query param is present', async () => {
    mockSearchParamsGet = jest.fn().mockImplementation((key) => (key === 'copyFrom' ? '42' : null));

    const mockTargetDiary = {
      id: 42,
      title: '特定の日報タイトル',
      content: '特定の日報本文テキスト',
      date: '2026-08-10T00:00:00.000Z',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTargetDiary,
    });

    render(<NewDiaryPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/diary/42');
      expect((screen.getByLabelText('タイトル') as HTMLInputElement).value).toBe('特定の日報タイトル');
      expect((screen.getByLabelText('内容') as HTMLTextAreaElement).value).toBe('特定の日報本文テキスト');
    });
  });
});
