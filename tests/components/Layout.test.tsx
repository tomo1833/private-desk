import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

// Mock the ThemeToggle component
jest.mock('@/app/components/ThemeToggle', () => {
  return function MockThemeToggle() {
    return <button data-testid="theme-toggle">Toggle Theme</button>;
  };
});

describe('RootLayout', () => {
  const mockChildren = <div data-testid="children">Test Content</div>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the layout with proper structure', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    // Check for header
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('glass', 'text-white', 'backdrop-blur-md', 'shadow-lg');
    
    // Check for main content area
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-grow', 'p-6', 'overflow-auto', 'mt-16', 'mb-16');
    
    // Check for footer
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('glass-dark', 'text-white', 'backdrop-blur-md', 'shadow-lg');
  });

  it('displays the correct site title', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    const titleLink = screen.getByRole('link', { name: /プライベートデスク/ });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute('href', '/');
  });

  it('includes search functionality', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    // Check for search form
    const searchInput = screen.getByPlaceholderText('検索');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveClass('px-3', 'py-2', 'text-white', 'placeholder-white/70', 'outline-none', 'bg-transparent');
    
    const searchButton = screen.getByRole('button', { name: '検索' });
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).toHaveClass('px-3', 'hover:bg-white/10', 'transition-colors');
    
    // Check search form has glassmorphism styling
    const searchForm = searchInput.closest('form');
    expect(searchForm).toHaveClass('flex', 'glass', 'rounded-lg', 'overflow-hidden', 'shadow-lg');
  });

  it('includes theme toggle component', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    const themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    const children = screen.getByTestId('children');
    expect(children).toBeInTheDocument();
  });

  it('has proper body styling with gradient background', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    const body = document.body;
    expect(body).toHaveClass('font-sans', 'flex', 'flex-col', 'min-h-screen', 'gradient-bg');
  });

  it('displays copyright information', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    const copyright = screen.getByText('© 2025 Private Desk App');
    expect(copyright).toBeInTheDocument();
    expect(copyright).toHaveClass('text-center', 'text-sm');
  });

  it('has proper lang attribute', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    const htmlElement = document.documentElement;
    expect(htmlElement).toHaveAttribute('lang', 'ja');
  });

  it('header has proper glassmorphism styling', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass(
      'glass',
      'text-white',
      'py-4',
      'px-6',
      'fixed',
      'top-0',
      'w-full',
      'z-10',
      'flex',
      'justify-between',
      'items-center',
      'backdrop-blur-md',
      'shadow-lg',
      'border-b',
      'border-white/10'
    );
  });

  it('footer has proper glassmorphism styling', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass(
      'glass-dark',
      'text-white',
      'py-4',
      'px-6',
      'fixed',
      'bottom-0',
      'w-full',
      'z-10',
      'backdrop-blur-md',
      'shadow-lg',
      'border-t',
      'border-white/10'
    );
  });

  it('has proper accessibility attributes', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    // Check for screen reader only text
    const srText = screen.getByText('- このアプリの共通レイアウト');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });
});