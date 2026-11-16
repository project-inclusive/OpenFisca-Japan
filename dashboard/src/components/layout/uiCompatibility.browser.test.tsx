import { ReactElement, useState } from 'react';
import { Button } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import TermsModal from '../TermsModal';
import { QuestionFrame } from '../questions/template/questionFrame';
import { AgeQuestionTemplate } from '../questions/template/ageQuestionTemplate';
import {
  initialAnswers,
  TestProviders,
} from '../questions/template/questionTemplateTestUtils';
import { Benefit } from '../result/benefit';
import { Loan } from '../result/loan';
import { GenericError } from '../errors/GenericError';
import { NotFoundError } from '../errors/NotFoundError';
import { FormResponseError } from '../errors/FormResponseError';
import { ErrorTestPage } from '../../mocks/resultTestUtils';
import {
  calculateFixtures,
  calculationDate,
} from '../../mocks/calculateFixtures';
import { currentDateAtom } from '../../state';
import { NarrowWidth } from './narrowWidth';

const expectFocused = async (element: Element) => {
  await expect.poll(() => document.activeElement === element).toBe(true);
};

const expectVisible = async (element: Element) => {
  await expect.poll(() => element.checkVisibility()).toBe(true);
};

const expectExpanded = async (element: Element, expanded: string) => {
  await expect.poll(() => element.getAttribute('aria-expanded')).toBe(expanded);
};

const expectNoHorizontalOverflow = async () => {
  await expect
    .poll(() => document.documentElement.scrollWidth)
    .toBeLessThanOrEqual(document.documentElement.clientWidth + 1);
};

const expectFitsWidth = (element: Element) => {
  const { left, right, width } = element.getBoundingClientRect();
  expect(width).toBeGreaterThan(0);
  expect(left).toBeGreaterThanOrEqual(-1);
  expect(right).toBeLessThanOrEqual(document.documentElement.clientWidth + 1);
};

const errors: { name: string; ui: ReactElement; path: string }[] = [
  { name: 'generic', ui: <GenericError />, path: '/' },
  { name: 'not found', ui: <NotFoundError />, path: '/' },
  { name: 'response', ui: <FormResponseError />, path: '/calculate' },
];

// Viewport changes test CSS breakpoints; they do not emulate a mobile user agent.
describe.each([390, 820, 1440])('UI at %i CSS pixels', (width) => {
  it('keeps question input and next reachable with Tab, skipping disabled back', async () => {
    await page.viewport(width, 900);
    const next = vi.fn();
    const assign = vi.fn();
    await render(
      <TestProviders>
        <MemoryRouter
          initialEntries={['/calculate']}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <QuestionFrame
            title="あなたについて"
            progress={0.1}
            hasHistory={false}
            backOnClick={vi.fn()}
            nextOnClick={next}
          >
            <AgeQuestionTemplate
              assignFunc={assign}
              initialValue={initialAnswers.age}
            />
          </QuestionFrame>
        </MemoryRouter>
      </TestProviders>
    );
    page.getByRole('link').element().focus();
    await userEvent.tab();
    const input = page.getByRole('textbox', { name: '年齢', exact: true });
    await expectFocused(input.element());
    expectFitsWidth(input.element());
    await userEvent.keyboard('{ArrowUp}');
    expect(assign).toHaveBeenLastCalledWith({ type: 'Age', selection: 1 });
    await userEvent.tab();
    const nextButton = page.getByRole('button', { name: '次へ', exact: true });
    await expectFocused(nextButton.element());
    expectFitsWidth(nextButton.element());
    await userEvent.tab({ shift: true });
    await expectFocused(input.element());
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(next).toHaveBeenCalledOnce();
    await expectNoHorizontalOverflow();
  });

  it('fits expanded results and keeps accordion arrow navigation focused', async () => {
    await page.viewport(width, 900);
    await render(
      <TestProviders
        initializeState={({ set }) => set(currentDateAtom, calculationDate)}
      >
        <NarrowWidth>
          <Benefit result={calculateFixtures.both.response} />
          <Loan result={calculateFixtures.both.response} />
        </NarrowWidth>
      </TestProviders>
    );
    const benefit = page.getByRole('button', { name: '児童手当 1.5 万円/月' });
    await expectVisible(benefit.element());
    benefit.element().focus();
    await userEvent.keyboard('{Enter}');
    await expectExpanded(benefit.element(), 'true');
    const first = page.getByRole('button', { name: '生活支援費 ~15 万円/月' });
    const second = page.getByRole('button', { name: '緊急小口資金 ~20 万円' });
    first.element().focus();
    await userEvent.keyboard('{ArrowDown}');
    await expectFocused(second.element());
    await userEvent.keyboard(' ');
    await expectExpanded(second.element(), 'true');
    const panel = document.getElementById(
      second.element().getAttribute('aria-controls')!
    )!;
    await expectVisible(panel);
    expectFitsWidth(panel);
    await expectNoHorizontalOverflow();
    await userEvent.keyboard('{Enter}');
    await expectExpanded(second.element(), 'false');
    await expectFocused(second.element());
  });

  it.each(errors)(
    'fits $name error and activates its recovery link by keyboard',
    async ({ ui, path }) => {
      await page.viewport(width, 900);
      await render(
        <ErrorTestPage
          ui={ui}
          state={{ isSimpleCalculation: false, isDisasterCalculation: false }}
        />
      );
      const back = page.getByRole('link', {
        name: /トップページに戻る|^戻る$/,
      });
      await expectVisible(back.element());
      expectFitsWidth(back.element());
      await expectNoHorizontalOverflow();
      back.element().focus();
      await expectFocused(back.element());
      await userEvent.keyboard('{Enter}');
      await expect
        .poll(() => page.getByTestId('pathname').element().textContent)
        .toBe(path);
    }
  );
});

const TermsTestPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>同意画面を開く</Button>
      <TermsModal
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        to="/calculate-simple"
      />
    </>
  );
};

it('traps focus in the terms modal and restores it to the trigger after Escape', async () => {
  await page.viewport(390, 900);
  await render(
    <TestProviders>
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <TermsTestPage />
      </MemoryRouter>
    </TestProviders>
  );
  const trigger = page.getByRole('button', { name: '同意画面を開く' });
  trigger.element().focus();
  await userEvent.keyboard('{Enter}');
  const dialog = page.getByRole('dialog');
  await expectVisible(dialog.element());
  await expect
    .poll(() => dialog.element().contains(document.activeElement))
    .toBe(true);
  await userEvent.tab({ shift: true });
  await expect
    .poll(() => dialog.element().contains(document.activeElement))
    .toBe(true);
  await userEvent.tab();
  await expect
    .poll(() => dialog.element().contains(document.activeElement))
    .toBe(true);
  await userEvent.keyboard('{Escape}');
  await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
  await expectFocused(trigger.element());
});
