import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { FormResponseError } from './FormResponseError';
import { GenericError } from './GenericError';
import { NotFoundError } from './NotFoundError';
import { calculationModes } from '../../mocks/calculateFixtures';
import { ErrorTestPage } from '../../mocks/resultTestUtils';

const meta = {
  title: 'Errors/Pages',
  component: ErrorTestPage,
  args: { ui: <GenericError /> },
} satisfies Meta<typeof ErrorTestPage>;
export default meta;
type Story = StoryObj<typeof meta>;

// Keep these views mounted so the audit inspects each error rather than its destination.
export const Generic: Story = {};
export const NotFound: Story = { args: { ui: <NotFoundError /> } };
export const Response: Story = {
  args: { ui: <FormResponseError />, state: calculationModes[1].state },
};

const goHome =
  (message: string): NonNullable<Story['play']> =>
  async ({ canvas }) => {
    await expect(canvas.getByText(message)).toBeVisible();
    const back = canvas.getByRole('link', { name: 'トップページに戻る' });
    await expect(back).toHaveAttribute('href', '/');
    back.focus();
    await expect(back).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByTestId('pathname').textContent).toBe('/')
    );
  };
export const GenericReturnsHome: Story = {
  play: goHome('予期せぬエラーが発生しました。'),
};
export const NotFoundReturnsHome: Story = {
  ...NotFound,
  play: goHome('ページが見つかりませんでした。'),
};

const returnsTo =
  (path: string): NonNullable<Story['play']> =>
  async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: '予期せぬエラーが発生しました' })
    ).toBeVisible();
    await expect(
      canvas.getByText('お手数ですがもう一度情報を入力してください。')
    ).toBeVisible();
    const back = canvas.getByRole('link', { name: '戻る' });
    await expect(back).toHaveAttribute('href', path);
    back.focus();
    await expect(back).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByTestId('pathname').textContent).toBe(path)
    );
  };
export const SimpleReturnsToForm: Story = {
  args: { ui: <FormResponseError />, state: calculationModes[0].state },
  play: returnsTo(calculationModes[0].formPath),
};
export const DetailedReturnsToForm: Story = {
  ...Response,
  play: returnsTo(calculationModes[1].formPath),
};
export const DisasterReturnsToForm: Story = {
  args: { ui: <FormResponseError />, state: calculationModes[2].state },
  play: returnsTo(calculationModes[2].formPath),
};
export const DetailedRedirectsHome: Story = {
  args: {
    ui: <FormResponseError />,
    state: { ...calculationModes[1].state, redirect: '/' },
  },
  play: returnsTo('/'),
};
export const SimplePrioritizesForm: Story = {
  args: {
    ui: <FormResponseError />,
    state: { ...calculationModes[0].state, redirect: '/' },
  },
  play: returnsTo(calculationModes[0].formPath),
};
export const DisasterPrioritizesForm: Story = {
  args: {
    ui: <FormResponseError />,
    state: { ...calculationModes[2].state, redirect: '/' },
  },
  play: returnsTo(calculationModes[2].formPath),
};
