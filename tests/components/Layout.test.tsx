import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

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
    expect(header).toHaveClass('backdrop-blur-md', 'shadow-lg');
    
    // Check for main content area - responsive mt and mb
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-grow', 'overflow-auto');
    
    // Check for footer
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('backdrop-blur-md', 'shadow-lg');
  });

  it('displays the correct site title', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    const titleLink = screen.getByRole('link', { name: /Private Desk/ });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute('href', '/');
  });

  it('includes search functionality', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    // Check for search form
    const searchInput = screen.getByPlaceholderText('検索');
    expect(searchInput).toBeInTheDocument();
    // Responsive classes: px-2 sm:px-3, py-1.5 sm:py-2, responsive text sizes
    expect(searchInput).toHaveClass('outline-none', 'bg-transparent');
    
    const searchButton = screen.getByRole('button', { name: '検索' });
    expect(searchButton).toBeInTheDocument();
    
    // Check search form has proper styling
    const searchForm = searchInput.closest('form');
    expect(searchForm).toHaveClass('flex', 'rounded-lg', 'overflow-hidden', 'shadow-md');
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
    
    const copyright = screen.getByText('© 2025 ～ 2026 Private Desk App');
    expect(copyright).toBeInTheDocument();
    // Responsive text: text-xs sm:text-sm
    expect(copyright).toHaveClass('text-center');
  });

  it('has proper lang attribute', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    const htmlElement = document.documentElement;
    expect(htmlElement).toHaveAttribute('lang', 'ja');
  });

  it('header has proper glassmorphism styling', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    const header = screen.getByRole('banner');
    // Updated for responsive design with bg-white/10, dark mode support, responsive padding
    expect(header).toHaveClass(
      'backdrop-blur-md',
      'fixed',
      'top-0',
      'w-full',
      'z-10',
      'shadow-lg',
      'border-b'
    );
  });

  it('footer has proper glassmorphism styling', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    const footer = screen.getByRole('contentinfo');
    // Updated for responsive design with bg-gray-900/10, dark mode support, responsive padding
    expect(footer).toHaveClass(
      'backdrop-blur-md',
      'fixed',
      'bottom-0',
      'w-full',
      'z-10',
      'shadow-lg',
      'border-t'
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