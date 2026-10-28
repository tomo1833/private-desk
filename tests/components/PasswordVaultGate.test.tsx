import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PasswordVaultGate from '@/app/components/PasswordVaultGate';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const createResponse = (data: unknown, ok = true) =>
  ({
    ok,
    json: async () => data,
  }) as Response;

describe('PasswordVaultGate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('sets up the vault before showing password manager content', async () => {
    mockFetch
      .mockResolvedValueOnce(createResponse({ configured: false, unlocked: false }))
      .mockResolvedValueOnce(createResponse({ unlocked: true }))
      .mockResolvedValueOnce(createResponse({ configured: true, unlocked: true }));

    render(
      <PasswordVaultGate>
        <p>Vault contents</p>
      </PasswordVaultGate>
    );

    await screen.findByRole('heading', { name: '保管庫を初期設定' });
    expect(screen.queryByText('Vault contents')).not.toBeInTheDocument();

    const inputs = screen.getAllByLabelText(/マスターパスワード|確認用/);
    fireEvent.change(inputs[0], { target: { value: 'a long unique passphrase' } });
    fireEvent.change(inputs[1], { target: { value: 'a long unique passphrase' } });
    fireEvent.click(screen.getByRole('button', { name: '保管庫を作成' }));

    expect(await screen.findByText('Vault contents')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        '/api/password-vault/setup',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
