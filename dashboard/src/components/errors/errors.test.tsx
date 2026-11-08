// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { FormResponseError } from './FormResponseError';
import { GenericError } from './GenericError';
import { NotFoundError } from './NotFoundError';
import { calculationModes } from '../../mocks/calculateFixtures';
import { renderErrorPage } from '../../mocks/resultTestUtils';

afterEach(cleanup);

describe('error pages', () => {
  it.each([
    { component: GenericError, message: '予期せぬエラーが発生しました。' },
    { component: NotFoundError, message: 'ページが見つかりませんでした。' },
  ])(
    'shows $message and returns home',
    async ({ component: Component, message }) => {
      const user = userEvent.setup();
      renderErrorPage(<Component />);
      expect(screen.getByText(message)).toBeVisible();
      const back = screen.getByRole('link', { name: 'トップページに戻る' });
      expect(back).toHaveAttribute('href', '/');
      await user.click(back);
      expect(screen.getByTestId('pathname').textContent).toBe('/');
    }
  );

  it.each(calculationModes)(
    'FormResponseError returns to the $name form by default',
    async ({ state, formPath }) => {
      const user = userEvent.setup();
      renderErrorPage(<FormResponseError />, state);
      expect(
        screen.getByRole('heading', { name: '予期せぬエラーが発生しました' })
      ).toBeVisible();
      expect(
        screen.getByText('お手数ですがもう一度情報を入力してください。')
      ).toBeVisible();
      const back = screen.getByRole('link', { name: '戻る' });
      expect(back).toHaveAttribute('href', formPath);
      await user.click(back);
      expect(screen.getByTestId('pathname').textContent).toBe(formPath);
    }
  );

  it('FormResponseError honors an explicit redirect in detailed mode', async () => {
    const user = userEvent.setup();
    renderErrorPage(<FormResponseError />, {
      ...calculationModes[1].state,
      redirect: '/',
    });
    await user.click(screen.getByRole('link', { name: '戻る' }));
    expect(screen.getByTestId('pathname').textContent).toBe('/');
  });

  it.each([calculationModes[0], calculationModes[2]])(
    'FormResponseError prioritizes the $name form over redirect',
    async ({ state, formPath }) => {
      const user = userEvent.setup();
      renderErrorPage(<FormResponseError />, { ...state, redirect: '/' });
      await user.click(screen.getByRole('link', { name: '戻る' }));
      expect(screen.getByTestId('pathname').textContent).toBe(formPath);
    }
  );
});
