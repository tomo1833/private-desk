import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import StockPortfolioPage from '@/app/stocks/page';

describe('StockPortfolioPage Component', () => {
  const mockStocks = [
    {
      id: 1,
      code: '7203',
      name: 'トヨタ自動車',
      market: 'プライム',
      shares: 100,
      acquisition_price: 2500,
      current_price: 2700,
      dividend_per_share: 90,
      memo: 'テストメモ',
      display_order: 1,
      created_at: '2026-08-12T00:00:00Z',
      updated_at: '2026-08-12T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockStocks,
    } as any);
  });

  it('renders summary values and stock items correctly', async () => {
    render(<StockPortfolioPage />);

    await waitFor(() => {
      expect(screen.getByText('📈 日本株ポートフォリオ')).toBeInTheDocument();
      expect(screen.getByText('トヨタ自動車')).toBeInTheDocument();
      expect(screen.getByText('7203')).toBeInTheDocument();
    });

    // 100 shares * 2700 = 270,000 eval value (present in summary and table)
    const evalElements = screen.getAllByText('¥270,000');
    expect(evalElements.length).toBeGreaterThanOrEqual(1);

    // Dividend: 100 * 90 = 9,000
    const divElements = screen.getAllByText('¥9,000');
    expect(divElements.length).toBeGreaterThanOrEqual(1);
  });
});
