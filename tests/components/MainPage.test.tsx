import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainPage from '@/app/(main)/page';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const createResponse = (data: unknown, ok = true) =>
  ({
    ok,
    json: async () => data,
  }) as Response;

describe('MainPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockFetch.mockResolvedValue(createResponse([]));
  });

  it('keeps the workspace usable while recent diaries load', () => {
    mockFetch.mockImplementation(() => new Promise<Response>(() => {}));

    render(<MainPage />);

    expect(
      screen.getByRole('heading', { name: '今日のデスク' })
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      '最新の日記を読み込み中...'
    );
  });

  it('renders recent diaries successfully', async () => {
    mockFetch.mockResolvedValue(
      createResponse([
        {
          id: 1,
          title: 'Test Diary 1',
          content: 'Content 1',
          created_at: '2025-01-01',
          display_order: 0,
        },
        {
          id: 2,
          title: 'Test Diary 2',
          content: 'Content 2',
          created_at: '2025-01-02',
          display_order: 1,
        },
      ])
    );

    render(<MainPage />);

    expect(
      await screen.findByRole('heading', { name: '最近の日記' })
    ).toBeInTheDocument();
    expect(await screen.findByText('Test Diary 1')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Test Diary 1/ })).toHaveAttribute(
      'href',
      '/diaries/1'
    );
  });

  it('renders an empty state when no diaries exist', async () => {
    render(<MainPage />);

    expect(
      await screen.findByText('まだ日記がありません')
    ).toBeInTheDocument();
    const emptyState = screen.getByText('まだ日記がありません').parentElement;
    expect(emptyState?.querySelector('a')).toHaveAttribute(
      'href',
      '/diaries/new'
    );
  });

  it('shows an error when recent diaries cannot be loaded', async () => {
    mockFetch.mockResolvedValue(createResponse(null, false));

    render(<MainPage />);

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('最新の日記を読み込めませんでした。');
  });

  it('provides clear quick actions for common tasks', () => {
    render(<MainPage />);

    expect(
      screen.getByRole('link', { name: /日記を書く/ })
    ).toHaveAttribute('href', '/diaries/new');
    expect(
      screen.getByRole('link', { name: /予定を確認/ })
    ).toHaveAttribute('href', '/schedule');
    expect(
      screen.getByRole('link', { name: /支出を記録/ })
    ).toHaveAttribute('href', '/expenses/new');
  });

  it('lists the application features by category', () => {
    render(<MainPage />);

    expect(
      screen.getByRole('heading', { name: '機能を探す' })
    ).toBeInTheDocument();
    expect(screen.getByText('記録・ナレッジ')).toBeInTheDocument();
    expect(screen.getByText('エンタメ・学び')).toBeInTheDocument();
    expect(screen.getByText('暮らし・管理')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /パスワード/ })).toHaveAttribute(
      'href',
      '/passwords'
    );
  });

  it('filters features by name and related keywords', async () => {
    const user = userEvent.setup();
    render(<MainPage />);

    await user.type(
      screen.getByRole('searchbox', { name: '機能名や内容で絞り込む' }),
      '投資'
    );

    expect(screen.getByRole('link', { name: /日本株/ })).toHaveAttribute(
      'href',
      '/stocks'
    );
    expect(screen.queryByText('Wiki', { exact: true })).not.toBeInTheDocument();
    expect(screen.getByText('1 件の機能')).toBeInTheDocument();
  });

  it('shows recent diary navigation after data loads', async () => {
    mockFetch.mockResolvedValue(
      createResponse([
        {
          id: 1,
          title: 'Test Diary 1',
          content: 'Diary content 1',
          created_at: '2025-01-01',
          display_order: 0,
        },
      ])
    );

    render(<MainPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Test Diary 1/ })).toHaveAttribute(
        'href',
        '/diaries/1'
      );
    });
  });
});
