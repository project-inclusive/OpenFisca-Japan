// @vitest-environment jsdom
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  calculateFailureHandlers,
  calculateSuccessHandler,
} from '../../mocks/handlers';
import { calculationModes, resultCases } from '../../mocks/calculateFixtures';
import { renderResult } from '../../mocks/resultTestUtils';
import { server } from '../../mocks/server';

describe('Result', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_BRANCH', '');
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it.each(resultCases)(
    'renders $scenario after a successful calculation',
    async ({ scenario, benefit, loan }) => {
      server.use(calculateSuccessHandler(scenario));
      renderResult(scenario);
      expect(await screen.findByText('見積もり結果')).toBeVisible();
      expect(screen.getByTestId('pathname')).toHaveTextContent('/result');

      if (benefit) {
        expect(
          await screen.findByText('給付される可能性のあるお金')
        ).toBeVisible();
        expect(
          screen.getByRole('button', { name: '児童手当 1.5 万円/月' })
        ).toBeVisible();
        expect(
          screen.getByRole('button', { name: '児童扶養手当 1~4.5 万円/月' })
        ).toBeVisible();
      } else {
        expect(
          screen.queryByText('給付される可能性のあるお金')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: /児童.*手当/ })
        ).not.toBeInTheDocument();
      }
      if (loan) {
        expect(
          await screen.findByText('借りられる可能性のあるお金')
        ).toBeVisible();
        expect(screen.getByText('生活福祉資金貸付制度')).toBeVisible();
        expect(
          screen.getByRole('button', { name: '生活支援費 ~15 万円/月' })
        ).toBeVisible();
        expect(
          screen.getByRole('button', { name: '緊急小口資金 ~20 万円' })
        ).toBeVisible();
      } else {
        expect(
          screen.queryByText('借りられる可能性のあるお金')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: /生活支援費|緊急小口資金/ })
        ).not.toBeInTheDocument();
      }
      if (!benefit && !loan) {
        expect(
          await screen.findByText(
            '今回は支援が見つかりませんでした。次の可能性があります：'
          )
        ).toBeVisible();
        expect(
          screen.getByText('入力をミスした（例：年収が高すぎた）')
        ).toBeVisible();
        expect(
          screen.getByText('ヤドカリくんはいつでも応援していますよ')
        ).toBeVisible();
      } else {
        expect(
          screen.queryByText(
            '今回は支援が見つかりませんでした。次の可能性があります：'
          )
        ).not.toBeInTheDocument();
      }
      expect(
        screen.queryByText('予期せぬエラーが発生しました')
      ).not.toBeInTheDocument();
    }
  );

  describe.each(Object.entries(calculateFailureHandlers))(
    '%s',
    (_name, handler) => {
      it.each(calculationModes)(
        'navigates to the error page and returns correctly in $name mode',
        async ({ state, resultErrorPath }) => {
          server.use(handler);
          const user = userEvent.setup();
          renderResult('both', state);
          expect(
            await screen.findByRole('heading', {
              name: '予期せぬエラーが発生しました',
            })
          ).toBeVisible();
          expect(
            screen.getByText('お手数ですがもう一度情報を入力してください。')
          ).toBeVisible();
          expect(screen.getByTestId('pathname')).toHaveTextContent(
            '/response-error'
          );
          expect(screen.queryByText('見積もり結果')).not.toBeInTheDocument();
          const back = screen.getByRole('link', { name: '戻る' });
          expect(back).toHaveAttribute('href', resultErrorPath);
          await user.click(back);
          await waitFor(() =>
            expect(screen.getByTestId('pathname').textContent).toBe(
              resultErrorPath
            )
          );
        }
      );
    }
  );
});
