import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  SharedResultTestPage,
  replaceShareLocation,
  savedShareKeys,
  shareModes,
  shareQuery,
} from '../../mocks/shareResultTestUtils';
import { calculateSuccessHandler } from '../../mocks/handlers';

const meta = {
  title: 'Results/Shared links',
  component: SharedResultTestPage,
  args: { query: shareQuery(savedShareKeys.compact) },
  parameters: { msw: { handlers: [calculateSuccessHandler('both')] } },
  // Result reads window.location as well as the router. Restore the preview URL
  // after each story so links and mode flags cannot leak to other stories.
  beforeEach: ({ args }) => replaceShareLocation(args.query),
} satisfies Meta<typeof SharedResultTestPage>;
export default meta;
type Story = StoryObj<typeof meta>;

const restored =
  (label: string, frontend = true): NonNullable<Story['play']> =>
  async ({ canvas }) => {
    await expect(await canvas.findByText('見積もり結果')).toBeVisible();
    await expect(canvas.getByText(label, { exact: true })).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: '児童手当 1.5 万円/月' })
    ).toBeVisible();
    if (frontend) {
      await expect(
        await canvas.findByRole('button', { name: '雇用保険（失業手当）' })
      ).toBeVisible();
    } else {
      await expect(
        canvas.queryByRole('button', { name: '雇用保険（失業手当）' })
      ).not.toBeInTheDocument();
    }
    await expect(
      canvas.queryByRole('heading', { name: '予期せぬエラーが発生しました' })
    ).not.toBeInTheDocument();
  };

export const CompactSimple: Story = {
  args: { query: shareQuery(savedShareKeys.compact, shareModes[0].flags) },
  play: restored(shareModes[0].label),
};
export const CompactDetailed: Story = { play: restored(shareModes[1].label) };
export const CompactDisaster: Story = {
  args: { query: shareQuery(savedShareKeys.compact, shareModes[2].flags) },
  play: restored(shareModes[2].label),
};
export const LegacyWithFrontend: Story = {
  args: { query: shareQuery(savedShareKeys.legacy) },
  play: restored(shareModes[1].label),
};
export const LegacyWithoutFrontend: Story = {
  args: { query: shareQuery(savedShareKeys.legacyWithoutFrontend) },
  play: restored(shareModes[1].label, false),
};
export const CorruptLink: Story = {
  args: { query: shareQuery('not-a-valid-share-key!') },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole('heading', {
        name: '予期せぬエラーが発生しました',
      })
    ).toBeVisible();
    await expect(
      canvas.getByText('お手数ですがもう一度情報を入力してください。')
    ).toBeVisible();
    await expect(canvas.getByRole('link', { name: '戻る' })).toHaveAttribute(
      'href',
      '/'
    );
    await expect(canvas.queryByText('見積もり結果')).not.toBeInTheDocument();
  },
};
