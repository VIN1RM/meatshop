import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { CompleteProfileScreen } from './complete-profile-screen';
import { usePanelAccess } from '@/shared/providers/panel-access-provider';
import { apiPatch, apiPost } from '@/shared/lib/api';

jest.mock('@/shared/providers/panel-access-provider', () => ({ usePanelAccess: jest.fn() }));
jest.mock('@/shared/lib/api', () => ({ apiPatch: jest.fn(), apiPost: jest.fn() }));
jest.mock('@/shared/lib/toast', () => ({ toast: { success: jest.fn() } }));

describe('Complete profile screen', () => {
  let root: Root;
  let container: HTMLDivElement;
  const refresh = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement('div'); document.body.append(container); root = createRoot(container);
    jest.mocked(usePanelAccess).mockReturnValue({ user: {
      id: 9, name: 'Novo integrante', email: 'novo@example.com', cpf: '52998224725', phone: '11999999999', app_profile: 'CLIENT', profile_complete: false,
    }, refresh } as never);
  });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
  async function render() { await act(async () => root.render(<CompleteProfileScreen />)); }
  async function submit() { await act(async () => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))); }

  it('prefills the employee data and saves normalized fields without changing the access role', async () => {
    jest.mocked(apiPatch).mockResolvedValue({ user: { profile_complete: true } });
    await render();
    expect((container.querySelector('#complete-cpf') as HTMLInputElement).value).toBe('529.982.247-25');
    expect((container.querySelector('#complete-email') as HTMLInputElement).readOnly).toBe(true);
    await submit();
    expect(apiPatch).toHaveBeenCalledWith('/users/me', { name: 'Novo integrante', cpf: '52998224725', phone: '11999999999', app_profile: 'CLIENT' }, { silent: true });
    expect(refresh).toHaveBeenCalledTimes(1);
  });
  it('shows a missing telephone error without calling the backend', async () => {
    const access = jest.mocked(usePanelAccess).getMockImplementation()!();
    jest.mocked(usePanelAccess).mockReturnValue({ ...access, user: { ...access.user!, phone: null } } as never);
    await render(); await submit();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('telefone');
    expect(apiPatch).not.toHaveBeenCalled();
  });
  it('keeps the form available when the server rejects the data', async () => {
    jest.mocked(apiPatch).mockRejectedValue(new Error('Telefone já cadastrado.'));
    await render(); await submit();
    expect(container.querySelector('[role="alert"]')?.textContent).toBe('Telefone já cadastrado.');
    expect(refresh).not.toHaveBeenCalled();
  });
  it('does not release access if the server still marks the profile incomplete', async () => {
    jest.mocked(apiPatch).mockResolvedValue({ user: { profile_complete: false } });
    await render(); await submit();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('ainda está incompleto');
    expect(refresh).not.toHaveBeenCalled();
  });
  it('can log out without completing the form', async () => {
    const dispatch = jest.spyOn(window, 'dispatchEvent');
    jest.mocked(apiPost).mockResolvedValue({ ok: true });
    await render();
    const exit = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Sair da conta')!;
    await act(async () => exit.click());
    expect(apiPost).toHaveBeenCalledWith('/auth/logout', {}, { silent: true });
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:session-expired' }));
    dispatch.mockRestore();
  });
});
