import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewWishlistItemPage from '@/app/wishlists/new/page';
import WishlistPage from '@/app/wishlists/page';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const wishlistItems = [
  {
    id: 7,
    title: 'テスト用キーボード',
    category: 'ガジェット',
    price: 12000,
    priority: 'High',
    status: 'Wanted',
    memo: '静かな打鍵感',
    created_at: '2026-10-01T00:00:00.000Z',
  },
];

describe('Wishlist experience', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => wishlistItems,
    } as Response);
  });

  it('provides labeled, consistent fields in the create form', async () => {
    const user = userEvent.setup();
    render(<NewWishlistItemPage />);

    expect(screen.getByRole('textbox', { name: /品名/ })).toHaveAttribute(
      'id',
      'wishlist-title'
    );
    expect(screen.getByLabelText('予想価格 (円)')).toBeInTheDocument();
    expect(screen.getByLabelText('優先度')).toBeInTheDocument();
    expect(screen.getByLabelText('ステータス')).toBeInTheDocument();
    expect(screen.getByLabelText('商品ページURL (任意)')).toBeInTheDocument();
    expect(screen.getByLabelText('画像URL (任意)')).toBeInTheDocument();
    expect(screen.getByLabelText('メモ・欲しい理由 (任意)')).toBeInTheDocument();
    expect(screen.getByRole('form')).toHaveClass('card-form');

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'カテゴリ' }),
      'CUSTOM'
    );
    expect(screen.getByLabelText('新しいカテゴリ名')).toBeInTheDocument();
  });

  it('exposes labeled list filters, item actions, and result count', async () => {
    const { container } = render(<WishlistPage />);

    expect(
      await screen.findByRole('link', { name: 'テスト用キーボード' })
    ).toHaveAttribute('href', '/wishlists/7');
    expect(
      screen.getByRole('searchbox', { name: '商品名やメモを検索' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'ステータスで絞り込む' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'カテゴリで絞り込む' })
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('全 1 件');
    expect(
      screen.getByRole('combobox', { name: '「テスト用キーボード」のステータス' })
    ).toBeInTheDocument();
    expect(
      container.querySelector('a[href="/wishlists/edit/7"]')
    ).toBeInTheDocument();
  });
});
