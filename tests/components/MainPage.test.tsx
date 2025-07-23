import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainPage from '@/app/(main)/page';

// Mock the components
jest.mock('@/app/components/PasswordList', () => {
  return function MockPasswordList({ passwords }: { passwords: any[] }) {
    return (
      <div data-testid="password-list">
        {passwords.map(p => <div key={p.id} data-testid={`password-${p.id}`}>{p.title}</div>)}
      </div>
    );
  };
});

jest.mock('@/app/components/WikiCards', () => {
  return function MockWikiCards({ wikis }: { wikis: any[] }) {
    return (
      <div data-testid="wiki-cards">
        {wikis.map(w => <div key={w.id} data-testid={`wiki-${w.id}`}>{w.title}</div>)}
      </div>
    );
  };
});

jest.mock('@/app/components/DiaryCards', () => {
  return function MockDiaryCards({ diaries, onDelete }: { diaries: any[], onDelete: (id: number) => void }) {
    return (
      <div data-testid="diary-cards">
        {diaries.map(d => (
          <div key={d.id} data-testid={`diary-${d.id}`}>
            {d.title}
            <button onClick={() => onDelete(d.id)} data-testid={`delete-diary-${d.id}`}>Delete</button>
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('@/app/components/BlogCards', () => {
  return function MockBlogCards({ blogs, onDelete }: { blogs: any[], onDelete: (id: number) => void }) {
    return (
      <div data-testid="blog-cards">
        {blogs.map(b => (
          <div key={b.id} data-testid={`blog-${b.id}`}>
            {b.title}
            <button onClick={() => onDelete(b.id)} data-testid={`delete-blog-${b.id}`}>Delete</button>
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('@/app/components/ScheduleCalendar', () => {
  return function MockScheduleCalendar() {
    return <div data-testid="schedule-calendar">Calendar Component</div>;
  };
});

describe('MainPage', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  const mockData = {
    passwords: [{ id: 1, title: 'Test Password', username: 'user1' }],
    wikis: [{ id: 1, title: 'Test Wiki', content: 'Wiki content' }],
    diaries: [{ id: 1, title: 'Test Diary', content: 'Diary content', created_at: '2025-01-01' }],
    blogs: [{ id: 1, title: 'Test Blog', content: 'Blog content', created_at: '2025-01-01' }],
    expenses: [
      { id: 1, amount: 1000, used_at: '2025-01-21', used_by: '共有' },
      { id: 2, amount: 2000, used_at: '2025-01-20', used_by: '妻' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default successful fetch responses
    mockFetch.mockImplementation((url: string | Request | URL) => {
      const urlString = url.toString();
      
      if (urlString.includes('/api/passwords')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData.passwords)
        } as Response);
      }
      if (urlString.includes('/api/wiki')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData.wikis)
        } as Response);
      }
      if (urlString.includes('/api/diary')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData.diaries)
        } as Response);
      }
      if (urlString.includes('/api/blog')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData.blogs)
        } as Response);
      }
      if (urlString.includes('/api/expense')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData.expenses)
        } as Response);
      }
      
      return Promise.resolve({
        ok: false,
        status: 404
      } as Response);
    });
  });

  it('renders loading state initially', () => {
    render(<MainPage />);
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('renders expense summary with proper styling', async () => {
    render(<MainPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    // Check expense summary card
    const expenseCard = screen.getByText('本日の支出').closest('div');
    expect(expenseCard).toHaveClass('card', 'float', 'p-6', 'mb-6');
    
    // Should show today's shared expenses (¥1,000) and month total (¥1,000)
    expect(screen.getByText('¥1,000')).toBeInTheDocument();
    expect(screen.getAllByText('¥1,000').length).toBeGreaterThan(1);
  });

  it('renders action buttons with proper styling and icons', async () => {
    render(<MainPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    // Check all action buttons have proper classes and icons
    const wikiButton = screen.getByRole('link', { name: '📝 Wiki登録' });
    expect(wikiButton).toHaveClass('btn', 'btn-primary', 'pulse-glow');
    expect(wikiButton).toHaveAttribute('href', '/wikis/new');

    const diaryButton = screen.getByRole('link', { name: '📔 日報登録' });
    expect(diaryButton).toHaveClass('btn', 'btn-purple');
    expect(diaryButton).toHaveAttribute('href', '/diaries/new');

    const blogButton = screen.getByRole('link', { name: '✍️ ブログ登録' });
    expect(blogButton).toHaveClass('btn', 'btn-indigo');
    expect(blogButton).toHaveAttribute('href', '/blogs/new');

    const passwordButton = screen.getByRole('link', { name: '🔐 パスワード登録' });
    expect(passwordButton).toHaveClass('btn', 'btn-success');
    expect(passwordButton).toHaveAttribute('href', '/passwords/new');

    const filesButton = screen.getByRole('link', { name: '📁 ファイル管理' });
    expect(filesButton).toHaveClass('btn', 'btn-secondary');
    expect(filesButton).toHaveAttribute('href', '/files');

    const expensesButton = screen.getByRole('link', { name: '💰 家計簿' });
    expect(expensesButton).toHaveClass('btn', 'btn-warning');
    expect(expensesButton).toHaveAttribute('href', '/expenses');
  });

  it('renders sections with proper card styling and icons', async () => {
    render(<MainPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    // Check diary section
    const diarySection = screen.getByText('📔 最新日報').closest('section');
    expect(diarySection).toHaveClass('card', 'p-6');
    expect(screen.getByText('📔 最新日報')).toHaveClass('heading-2', 'mb-4', 'flex', 'items-center');

    // Check wiki section
    const wikiSection = screen.getByText('📝 最新Wiki').closest('section');
    expect(wikiSection).toHaveClass('card', 'p-6');
    expect(screen.getByText('📝 最新Wiki')).toHaveClass('heading-2', 'mb-4', 'flex', 'items-center');

    // Check blog section
    const blogSection = screen.getByText('✍️ 最新ブログ').closest('section');
    expect(blogSection).toHaveClass('card', 'p-6');
    expect(screen.getByText('✍️ 最新ブログ')).toHaveClass('heading-2', 'mb-4', 'flex', 'items-center');

    // Check calendar section
    const calendarSection = screen.getByText('📅 予定カレンダー').closest('div');
    expect(calendarSection).toHaveClass('card', 'p-6');
    expect(screen.getByText('📅 予定カレンダー')).toHaveClass('heading-2', 'mb-4', 'flex', 'items-center');

    // Check password section
    const passwordSection = screen.getByText('🔐 パスワード一覧').closest('section');
    expect(passwordSection).toHaveClass('card', 'p-6');
    expect(screen.getByText('🔐 パスワード一覧')).toHaveClass('heading-2', 'mb-4', 'flex', 'items-center');
  });

  it('displays data when loaded successfully', async () => {
    render(<MainPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    // Check that components are rendered with data
    expect(screen.getByTestId('diary-cards')).toBeInTheDocument();
    expect(screen.getByTestId('wiki-cards')).toBeInTheDocument();
    expect(screen.getByTestId('blog-cards')).toBeInTheDocument();
    expect(screen.getByTestId('password-list')).toBeInTheDocument();
    expect(screen.getByTestId('schedule-calendar')).toBeInTheDocument();
  });

  it('displays empty states when no data available', async () => {
    // Mock empty responses
    mockFetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      } as Response);
    });

    render(<MainPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('登録された日報がありません。')).toBeInTheDocument();
    expect(screen.getByText('登録されたWikiがありません。')).toBeInTheDocument();
    expect(screen.getByText('登録されたブログがありません。')).toBeInTheDocument();
    expect(screen.getByText('登録されたパスワードがありません。')).toBeInTheDocument();
  });

  it('displays error states when API calls fail', async () => {
    // Mock failed responses
    mockFetch.mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        status: 500
      } as Response);
    });

    render(<MainPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    // Should show error messages for failed requests
    expect(screen.getAllByText(/の取得に失敗しました。/).length).toBeGreaterThan(0);
  });

  it('handles delete functionality for diaries and blogs', async () => {
    const user = userEvent.setup();
    render(<MainPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    // Test diary deletion
    const deleteDiaryButton = screen.getByTestId('delete-diary-1');
    await user.click(deleteDiaryButton);
    
    expect(screen.queryByTestId('diary-1')).not.toBeInTheDocument();

    // Test blog deletion
    const deleteBlogButton = screen.getByTestId('delete-blog-1');
    await user.click(deleteBlogButton);
    
    expect(screen.queryByTestId('blog-1')).not.toBeInTheDocument();
  });

  it('has proper responsive layout classes', async () => {
    render(<MainPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    // Check main grid layout
    const mainGrid = screen.getByText('📔 最新日報').closest('.grid');
    expect(mainGrid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-6');

    // Check button container
    const buttonContainer = screen.getByRole('link', { name: '📝 Wiki登録' }).closest('.flex');
    expect(buttonContainer).toHaveClass('flex', 'flex-wrap', 'justify-center', 'gap-3', 'mb-8');
  });

  it('renders "View all" links with proper styling', async () => {
    render(<MainPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    const viewAllLinks = screen.getAllByText('→ 一覧を見る');
    viewAllLinks.forEach(link => {
      expect(link).toHaveClass('text-sm', 'text-blue-600', 'hover:underline', 'font-medium', 'transition-colors');
    });

    // Check specific hrefs
    expect(screen.getByRole('link', { name: '→ 一覧を見る' })).toHaveAttribute('href');
  });
});