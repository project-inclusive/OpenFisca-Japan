import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ResultTestPage } from '../../mocks/resultTestUtils';
import { resultCases, calculationModes } from '../../mocks/calculateFixtures';
import {
  calculateSuccessHandler,
  calculateFailureHandlers,
} from '../../mocks/handlers';

const meta = {
  title: 'Results/Calculation',
  component: ResultTestPage,
  args: { scenario: 'both' },
} satisfies Meta<typeof ResultTestPage>;
export default meta;
type Story = StoryObj<typeof meta>;

const checkAccordionKeyboard = async (button: HTMLElement) => {
  button.focus();
  await expect(button).toHaveFocus();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await userEvent.keyboard(' ');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  const panel = document.getElementById(button.getAttribute('aria-controls')!)!;
  await waitFor(() => expect(panel).toBeVisible());
  await userEvent.tab();
  await expect(
    within(panel).getByRole('link', { name: '詳細リンク' })
  ).toHaveFocus();
  await userEvent.tab({ shift: true });
  await expect(button).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toHaveFocus();
  // Let the exit animation finish before the story's accessibility audit.
  await waitFor(() => expect(panel).not.toBeVisible());
};

const checkResult: NonNullable<Story['play']> = async ({ canvas, args }) => {
  await expect(await canvas.findByText('見積もり結果')).toBeVisible();
  await expect(canvas.getByTestId('pathname')).toHaveTextContent('/result');
  const { benefit, loan } = resultCases.find(
    ({ scenario }) => scenario === args.scenario
  )!;
  if (benefit) {
    await expect(
      await canvas.findByText('給付される可能性のあるお金')
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: '児童手当 1.5 万円/月' })
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: '児童扶養手当 1~4.5 万円/月' })
    ).toBeVisible();
  } else {
    await expect(
      canvas.queryByText('給付される可能性のあるお金')
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: /児童.*手当/ })
    ).not.toBeInTheDocument();
  }
  if (loan) {
    await expect(
      await canvas.findByText('借りられる可能性のあるお金')
    ).toBeVisible();
    await expect(canvas.getByText('生活福祉資金貸付制度')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: '生活支援費 ~15 万円/月' })
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: '緊急小口資金 ~20 万円' })
    ).toBeVisible();
  } else {
    await expect(
      canvas.queryByText('借りられる可能性のあるお金')
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: /生活支援費|緊急小口資金/ })
    ).not.toBeInTheDocument();
  }
  if (!benefit && !loan) {
    await expect(
      await canvas.findByText(
        '今回は支援が見つかりませんでした。次の可能性があります：'
      )
    ).toBeVisible();
    await expect(
      canvas.getByText('入力をミスした（例：年収が高すぎた）')
    ).toBeVisible();
    await expect(
      canvas.getByText('ヤドカリくんはいつでも応援していますよ')
    ).toBeVisible();
  } else {
    await expect(
      canvas.queryByText(
        '今回は支援が見つかりませんでした。次の可能性があります：'
      )
    ).not.toBeInTheDocument();
  }
  await expect(
    canvas.queryByText('予期せぬエラーが発生しました')
  ).not.toBeInTheDocument();
  if (benefit)
    await checkAccordionKeyboard(
      canvas.getByRole('button', { name: '児童手当 1.5 万円/月' })
    );
  if (loan)
    await checkAccordionKeyboard(
      canvas.getByRole('button', { name: '生活支援費 ~15 万円/月' })
    );
};

export const BenefitOnly: Story = {
  args: { scenario: 'benefit-only' },
  parameters: { msw: { handlers: [calculateSuccessHandler('benefit-only')] } },
  play: checkResult,
};
export const LoanOnly: Story = {
  args: { scenario: 'loan-only' },
  parameters: { msw: { handlers: [calculateSuccessHandler('loan-only')] } },
  play: checkResult,
};
export const Both: Story = {
  args: { scenario: 'both' },
  parameters: { msw: { handlers: [calculateSuccessHandler('both')] } },
  play: checkResult,
};
export const None: Story = {
  args: { scenario: 'none' },
  parameters: { msw: { handlers: [calculateSuccessHandler('none')] } },
  play: checkResult,
};

const checkFailure: NonNullable<Story['play']> = async ({ canvas, args }) => {
  await expect(
    await canvas.findByRole('heading', { name: '予期せぬエラーが発生しました' })
  ).toBeVisible();
  await expect(
    canvas.getByText('お手数ですがもう一度情報を入力してください。')
  ).toBeVisible();
  await expect(canvas.getByTestId('pathname')).toHaveTextContent(
    '/response-error'
  );
  await expect(canvas.queryByText('見積もり結果')).not.toBeInTheDocument();
  const mode = calculationModes.find(
    ({ state }) =>
      state.isSimpleCalculation === args.state?.isSimpleCalculation &&
      state.isDisasterCalculation === args.state?.isDisasterCalculation
  )!;
  await expect(canvas.getByRole('link', { name: '戻る' })).toHaveAttribute(
    'href',
    mode.resultErrorPath
  );
  // Leave the error rendered for the a11y audit; the error-page stories test navigation.
};
export const Http500Simple: Story = {
  args: { state: calculationModes[0].state },
  parameters: { msw: { handlers: [calculateFailureHandlers['HTTP 500']] } },
  play: checkFailure,
};
export const Http500Detailed: Story = {
  args: { state: calculationModes[1].state },
  parameters: { msw: { handlers: [calculateFailureHandlers['HTTP 500']] } },
  play: checkFailure,
};
export const Http500Disaster: Story = {
  args: { state: calculationModes[2].state },
  parameters: { msw: { handlers: [calculateFailureHandlers['HTTP 500']] } },
  play: checkFailure,
};
export const NetworkFailureSimple: Story = {
  args: { state: calculationModes[0].state },
  parameters: {
    msw: { handlers: [calculateFailureHandlers['network error']] },
  },
  play: checkFailure,
};
export const NetworkFailureDetailed: Story = {
  args: { state: calculationModes[1].state },
  parameters: {
    msw: { handlers: [calculateFailureHandlers['network error']] },
  },
  play: checkFailure,
};
export const NetworkFailureDisaster: Story = {
  args: { state: calculationModes[2].state },
  parameters: {
    msw: { handlers: [calculateFailureHandlers['network error']] },
  },
  play: checkFailure,
};
