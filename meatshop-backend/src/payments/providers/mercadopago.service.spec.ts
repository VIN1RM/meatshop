import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { Payment } from 'mercadopago';
import { MercadoPagoService } from './mercadopago.service';

describe('Mercado Pago payment resource validation', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function service(environment = 'sandbox') {
    return new MercadoPagoService(
      new ConfigService({
        MP_ACCESS_TOKEN: 'fixture-only',
        MP_COLLECTOR_ID: '77',
        MP_ENV: environment,
        PAYMENTS_ENABLED: 'true',
        MP_WEBHOOK_SECRET: 'fixture-webhook-secret',
      }),
    );
  }

  function response(liveMode: boolean | undefined, collector = 77) {
    return {
      api_response: { status: 200, headers: ['', []] as [string, string[]] },
      collector_id: collector,
      live_mode: liveMode,
      external_reference: '137',
      status: 'approved',
      status_detail: 'accredited',
      transaction_amount: 16.04,
      currency_id: 'BRL',
      payment_type_id: 'credit_card',
      payment_method_id: 'master',
      date_approved: '2026-11-16T23:00:00Z',
      fee_details: [{ amount: 0.5 }],
    };
  }

  it.each<[string, boolean]>([
    ['sandbox', false],
    ['production', true],
  ])('accepts the payment resource mode for %s', async (environment, mode) => {
    jest.spyOn(Payment.prototype, 'get').mockResolvedValue(response(mode));
    await expect(service(environment).getPaymentSnapshot('123')).resolves.toMatchObject({
      externalReference: '137',
      liveMode: mode,
      transactionAmount: 16.04,
      currencyId: 'BRL',
      feeAmount: 0.5,
    });
  });

  it.each<[string, boolean | undefined]>([
    ['sandbox', true],
    ['production', false],
    ['sandbox', undefined],
  ])('rejects an incompatible or missing payment live_mode in %s', async (environment, mode) => {
    jest.spyOn(Payment.prototype, 'get').mockResolvedValue(response(mode));
    await expect(service(environment).getPaymentSnapshot('123')).rejects.toThrow(
      'Payment environment mismatch',
    );
  });

  it('rejects another seller even when the environment and amount match', async () => {
    jest.spyOn(Payment.prototype, 'get').mockResolvedValue(response(false, 88));
    await expect(service().getPaymentSnapshot('123')).rejects.toThrow(
      'Payment belongs to another seller',
    );
  });

  it('does not fabricate an approval when the provider is unavailable', async () => {
    jest.spyOn(Payment.prototype, 'get').mockRejectedValue(new Error('Provider unavailable'));
    await expect(service().getPaymentSnapshot('123')).rejects.toThrow('Provider unavailable');
  });
});
