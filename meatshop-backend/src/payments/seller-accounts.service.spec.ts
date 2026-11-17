import { ConfigService } from '@nestjs/config';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import type { DataSource } from 'typeorm';
import { SellerAccountsService } from './seller-accounts.service';
import type { UnitAuthorizationService } from '../units/services/unit-authorization.service';

describe('Checkout Pro test seller authorization', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function service() {
    return new SellerAccountsService(
      {} as DataSource,
      new ConfigService({ MP_ENV: 'sandbox' }),
      {} as UnitAuthorizationService,
    ) as unknown as {
      token(body: Record<string, string>): Promise<{ user_id: number }>;
    };
  }

  it('requests a standard OAuth credential and accepts only a verified test seller', async () => {
    const fetch = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'APP_USR-fixture',
            refresh_token: 'refresh',
            expires_in: 3600,
            user_id: 9,
          }),
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 9, tags: ['test_user'] })));
    await expect(service().token({ grant_type: 'refresh_token' })).resolves.toMatchObject({
      user_id: 9,
    });
    expect(JSON.parse(fetch.mock.calls[0][1]!.body as string).test_token).toBe(false);
    expect(fetch.mock.calls[1][0]).toBe('https://api.mercadopago.com/users/me');
  });

  it.each([
    { id: 9, tags: [] },
    { id: 10, tags: ['test_user'] },
  ])('rejects a real or mismatched seller in sandbox', async (account) => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'APP_USR-fixture',
            refresh_token: 'refresh',
            expires_in: 3600,
            user_id: 9,
          }),
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify(account)));
    await expect(service().token({ grant_type: 'refresh_token' })).rejects.toThrow(
      'Sandbox requires a Mercado Pago test seller',
    );
  });
});
