import { fireEvent, render, screen } from '@testing-library/react';
import ListControls from '@/app/components/ListControls';

const createProps = (overrides: Partial<React.ComponentProps<typeof ListControls>> = {}) => ({
  searchQuery: '',
  onSearchChange: jest.fn(),
  viewMode: 'card' as const,
  onViewModeChange: jest.fn(),
  totalCount: 12,
  filteredCount: 4,
  ...overrides,
});

describe('ListControls', () => {
  it('labels search, sort, and view controls for assistive technology', () => {
    render(
      <ListControls
        {...createProps()}
        sortBy="newest"
        onSortChange={jest.fn()}
      />
    );

    expect(
      screen.getByRole('searchbox', { name: '一覧を検索' })
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '並び順' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '表示方法' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('4 / 12 件');
  });

  it('clears the search query with an explicit button action', () => {
    const onSearchChange = jest.fn();
    const props = createProps({ searchQuery: '読書', onSearchChange });
    const { rerender } = render(<ListControls {...props} />);

    fireEvent.click(screen.getByRole('button', { name: '検索条件をクリア' }));

    expect(onSearchChange).toHaveBeenCalledWith('');

    rerender(<ListControls {...props} searchQuery="" />);
    expect(
      screen.queryByRole('button', { name: '検索条件をクリア' })
    ).not.toBeInTheDocument();
  });

  it('exposes the active view mode and reports mode changes', () => {
    const onViewModeChange = jest.fn();
    render(
      <ListControls
        {...createProps({ onViewModeChange })}
        viewMode="card"
      />
    );

    const cardButton = screen.getByRole('button', { name: 'カード表示' });
    const tableButton = screen.getByRole('button', { name: 'テーブル表示' });
    expect(cardButton).toHaveAttribute('aria-pressed', 'true');
    expect(tableButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(tableButton);
    expect(onViewModeChange).toHaveBeenCalledWith('table');
  });
});
