// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCalculate } from './calculate';
import {
  calculateErrorBody,
  calculateFixtures,
  resultCases,
} from '../mocks/calculateFixtures';
import {
  calculateFailureHandlers,
  calculateSuccessHandler,
} from '../mocks/handlers';
import { server } from '../mocks/server';

describe('useCalculate over HTTP', () => {
  const requests: Request[] = [];
  const recordRequest = ({ request }: { request: Request }) => {
    requests.push(request.clone());
  };

  beforeEach(() => {
    vi.stubEnv('VITE_BRANCH', '');
    requests.length = 0;
    server.events.on('request:start', recordRequest);
  });
  afterEach(() => {
    cleanup();
    server.events.removeListener('request:start', recordRequest);
    vi.unstubAllEnvs();
  });

  it.each(resultCases)(
    '結果が $scenario のとき、世帯をPOSTし応答を保存する',
    { tags: ['communication:success'] },
    async ({ scenario }) => {
      const fixture = calculateFixtures[scenario];
      server.use(calculateSuccessHandler(scenario));
      const { result } = renderHook(() => useCalculate());
      expect(result.current[0]).toBeUndefined();
      expect(requests).toHaveLength(0);

      await act(async () => {
        await result.current[1](fixture.request);
      });

      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('http://localhost:50000/calculate');
      expect(requests[0].method).toBe('POST');
      expect(requests[0].headers.get('Content-Type')).toBe('application/json');
      expect(await requests[0].json()).toEqual(fixture.request);
      expect(result.current[0]).toEqual(fixture.response);
    }
  );

  it.each([undefined, null])(
    '世帯が %s のとき、送信せず結果を保存しない',
    { tags: ['communication:absent'] },
    async (household) => {
      const { result } = renderHook(() => useCalculate());
      await act(async () => {
        await result.current[1](household);
      });
      expect(requests).toHaveLength(0);
      expect(result.current[0]).toBeUndefined();
    }
  );

  it(
    'HTTP 500 のとき、ステータスと本文を含むエラーになる',
    { tags: ['communication:http500'] },
    async () => {
      server.use(calculateFailureHandlers['HTTP 500']);
      const { result } = renderHook(() => useCalculate());
      await act(async () => {
        await expect(
          result.current[1](calculateFixtures.both.request)
        ).rejects.toThrow(
          `unexpected error response: status: 500, body: ${calculateErrorBody}`
        );
      });
      expect(requests).toHaveLength(1);
      expect(result.current[0]).toBeUndefined();
    }
  );

  it(
    'ネットワーク失敗のとき、結果を保存せずエラーになる',
    { tags: ['communication:network'] },
    async () => {
      server.use(calculateFailureHandlers['network error']);
      const { result } = renderHook(() => useCalculate());
      await act(async () => {
        await expect(
          result.current[1](calculateFixtures.both.request)
        ).rejects.toBeInstanceOf(TypeError);
      });
      expect(requests).toHaveLength(1);
      expect(result.current[0]).toBeUndefined();
    }
  );

  it(
    '再計算のとき出力項目はnullのまま送信し、失敗すると前の成功結果を保つ',
    { tags: ['communication:retry'] },
    async () => {
      const household = structuredClone(calculateFixtures.both.request);
      const { result } = renderHook(() => useCalculate());
      await act(async () => {
        await result.current[1](household);
      });
      expect(result.current[0]).toEqual(calculateFixtures.both.response);

      server.use(calculateFailureHandlers['HTTP 500']);
      await act(async () => {
        await expect(result.current[1](household)).rejects.toThrow(
          'status: 500'
        );
      });
      expect(requests).toHaveLength(2);
      expect(await requests[1].json()).toEqual(calculateFixtures.both.request);
      expect(household).toEqual(calculateFixtures.both.request);
      expect(result.current[0]).toEqual(calculateFixtures.both.response);

      server.use(calculateSuccessHandler('none'));
      await act(async () => {
        await result.current[1](calculateFixtures.none.request);
      });
      expect(requests).toHaveLength(3);
      expect(result.current[0]).toEqual(calculateFixtures.none.response);
    }
  );
});
