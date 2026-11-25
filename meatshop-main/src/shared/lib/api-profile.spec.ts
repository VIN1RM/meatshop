import { apiGet } from './api';
import { toast } from './toast';
import { ApiError } from './api-error-translations';

jest.mock('@/shared/lib/toast', () => ({ toast: { error: jest.fn() } }));

describe('Profile completion API response', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; jest.restoreAllMocks(); });
  it('notifies the profile gate instead of displaying a generic permission toast', async () => {
    const dispatch = jest.spyOn(window, 'dispatchEvent');
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 403,
      text: async () => JSON.stringify({ code: 'PROFILE_INCOMPLETE', message: 'Complete the required profile fields before continuing.' }),
    });
    await expect(apiGet('/orders', { cache: false })).rejects.toMatchObject({
      status: 403, message: 'Complete seu perfil para continuar usando o painel.',
    } as Partial<ApiError>);
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'profile:required' }));
    expect(toast.error).not.toHaveBeenCalled();
  });
});
