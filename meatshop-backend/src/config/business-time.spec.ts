import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

describe('Brasilia backend process clock', () => {
  it.each(['UTC', 'Asia/Tokyo'])(
    'reads legacy timestamps consistently when the host uses %s',
    (zone) => {
      const result = spawnSync(
        process.execPath,
        [
          '-e',
          `
      require(${JSON.stringify(resolve('src/config/business-time.ts'))});
      const { types } = require('pg');
      const legacy = types.getTypeParser(1114)('2026-11-24 21:22:00');
      console.log(JSON.stringify({
        zone: process.env.TZ,
        instant: legacy.toISOString(),
        hour: legacy.getHours(),
      }));
    `,
        ],
        { env: { ...process.env, TZ: zone }, encoding: 'utf8' },
      );
      expect(result.stderr).toBe('');
      expect(result.status).toBe(0);
      expect(JSON.parse(result.stdout)).toEqual({
        zone: 'America/Sao_Paulo',
        instant: '2026-11-25T00:22:00.000Z',
        hour: 21,
      });
    },
  );
});
