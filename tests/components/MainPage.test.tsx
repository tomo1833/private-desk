import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainPage from '@/app/(main)/page';

// Mock fetch globally
global.fetch = jest.fn();

describe('MainPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(<MainPage />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('renders diary list successfully', async () => {
    const mockDiaries = [
      { id: 1, title: 'Test Diary 1', content: 'Content 1', created_at: '2025-01-01' },
      { id: 2, title: 'Test Diary 2', content: 'Content 2', created_at: '2025-01-02' },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockDiaries,
    });

    render(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText('日記一覧')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Diary 1')).toBeInTheDocument();
    expect(screen.getByText('Test Diary 2')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('renders empty state when no diaries', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText('まだ日記がありません')).toBeInTheDocument();
    });

    expect(screen.getByText('最初の日記を作成')).toBeInTheDocument();
  });

  it('renders error state on fetch failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    render(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText('日記の取得に失敗しました。')).toBeInTheDocument();
    });
  });

  it('renders new diary button', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText('📔 新規作成')).toBeInTheDocument();
    });

    const newButton = screen.getByText('📔 新規作成');
    expect(newButton.closest('a')).toHaveAttribute('href', '/diaries/new');
  });

  it('renders quick links to other features', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText('その他の機能')).toBeInTheDocument();
    });

    expect(screen.getByText('📝 Wiki')).toBeInTheDocument();
    expect(screen.getByText('✍️ ブログ')).toBeInTheDocument();
    expect(screen.getByText('🔐 パスワード')).toBeInTheDocument();
    expect(screen.getByText('💰 家計簿')).toBeInTheDocument();
    expect(screen.getByText('📁 ファイル')).toBeInTheDocument();
    expect(screen.getByText('🛢 SQL')).toBeInTheDocument();
    expect(screen.getByText('👤 著者')).toBeInTheDocument();
    expect(screen.getByText('🎭 ペルソナ')).toBeInTheDocument();
  });

  it('renders diary cards with proper styling', async () => {
    const mockDiaries = [
      { id: 1, title: 'Test Diary', content: 'Diary content', created_at: '2025-01-01' },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockDiaries,
    });

    render(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Diary')).toBeInTheDocument();
    });

    const diaryCard = screen.getByText('Test Diary').closest('li');
    expect(diaryCard).toHaveClass('bg-white/90');
    expect(diaryCard).toHaveClass('rounded-xl');
    expect(diaryCard).toHaveClass('shadow-lg');
  });

  it('renders formatted date for diaries', async () => {
    const mockDiaries = [
      { id: 1, title: 'Test Diary', content: 'Content', created_at: '2025-01-01' },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockDiaries,
    });

    render(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText('2025/1/1')).toBeInTheDocument();
    });
  });

  it('renders continue reading link', async () => {
    const mockDiaries = [
      { id: 1, title: 'Test Diary', content: 'Content', created_at: '2025-01-01' },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockDiaries,
    });

    render(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText('続きを読む →')).toBeInTheDocument();
    });

    const link = screen.getByText('続きを読む →');
    expect(link.closest('a')).toHaveAttribute('href', '/diaries/1');
  });

  it('has responsive layout classes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<MainPage />);

    await waitFor(() => {
      const mainContainer = screen.getByText('日記一覧').parentElement?.parentElement;
      expect(mainContainer).toHaveClass('space-y-4', 'max-w-7xl', 'mx-auto');
    });
  });
});
