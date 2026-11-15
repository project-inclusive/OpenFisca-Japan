import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { page, userEvent, type Locator } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-react';
import { AgeQuestionTemplate } from './ageQuestionTemplate';
import { AmountOfMoneyQuestionTemplate } from './amountOfMoneyQuestionTemplate';
import { ChildrenAgeQuestionTemplate } from './childrenAgeQuestionTemplate';
import { PersonNumQuestionTemplate } from './personNumQuestionTemplate';
import { QuestionValidity, TestProviders } from './questionTemplateTestUtils';

const value = (input: Locator, expected: string) =>
  expect
    .poll(() => (input.query() as HTMLInputElement | null)?.value)
    .toBe(expected);
const validity = (valid: boolean) =>
  expect
    .poll(() => page.getByRole('status').query()?.textContent)
    .toBe(String(valid));
const focused = (input: Locator) =>
  expect.poll(() => document.activeElement === input.query()).toBe(true);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 0, 15, 12));
});
afterEach(async () => {
  await cleanup();
  vi.useRealTimers();
});

it.each(['age', 'money', 'child age'] as const)(
  'focuses restored %s, clears it with the keyboard, and accepts zero',
  async (template) => {
    const assign = vi.fn();
    await render(
      <TestProviders>
        {template === 'age' && (
          <AgeQuestionTemplate
            assignFunc={assign}
            initialValue={{ type: 'Age', selection: 2 }}
          />
        )}
        {template === 'money' && (
          <AmountOfMoneyQuestionTemplate
            title="月収"
            assignFunc={assign}
            initialValue={{ type: 'AmountOfMoney', selection: 2, unit: '万円' }}
          />
        )}
        {template === 'child age' && (
          <ChildrenAgeQuestionTemplate
            assignFunc={assign}
            initialValue={{ type: 'Age', selection: 2 }}
          />
        )}
        <QuestionValidity />
      </TestProviders>
    );
    const input = page.getByRole('textbox', {
      name: template === 'money' ? '月収' : '年齢',
      exact: true,
    });
    await value(input, '2');
    await validity(true);
    expect(assign).not.toHaveBeenCalled();
    await input.click();
    await focused(input);
    await userEvent.keyboard('{ArrowUp}');
    await value(input, '3');
    await userEvent.keyboard('{End}{Backspace}');
    await value(input, '');
    await validity(false);
    await userEvent.keyboard('0');
    await value(input, '0');
    await validity(true);
    expect(assign).toHaveBeenLastCalledWith(
      template === 'money'
        ? { type: 'AmountOfMoney', selection: 0, unit: '万円' }
        : { type: 'Age', selection: 0 }
    );
    await userEvent.tab();
    await expect
      .poll(() => document.activeElement === input.query())
      .toBe(false);
  }
);

it('focuses the child school year and converts a keyboard edit into an age', async () => {
  const assign = vi.fn();
  await render(
    <TestProviders>
      <ChildrenAgeQuestionTemplate
        assignFunc={assign}
        initialValue={{ type: 'Age', selection: 7 }}
      />
      <QuestionValidity />
    </TestProviders>
  );
  const age = page.getByRole('textbox', { name: '年齢', exact: true });
  const year = page.getByRole('textbox').nth(1);
  await value(year, '1');
  await year.click();
  await focused(year);
  await userEvent.keyboard('{End}{Backspace}2');
  await value(year, '2');
  await value(age, '8');
  await expect
    .poll(
      () =>
        (page.getByRole('combobox').query() as HTMLSelectElement | null)?.value
    )
    .toBe('小学校');
  expect(assign).toHaveBeenLastCalledWith({ type: 'Age', selection: 8 });
  await validity(true);
});

it('prevents Enter in the money field from submitting the surrounding form', async () => {
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  await render(
    <TestProviders>
      <form onSubmit={submit}>
        <AmountOfMoneyQuestionTemplate
          title="月収"
          assignFunc={vi.fn()}
          initialValue={{ type: 'AmountOfMoney', selection: 2, unit: '万円' }}
        />
        <button type="submit">続ける</button>
      </form>
      <QuestionValidity />
    </TestProviders>
  );
  const input = page.getByRole('textbox', { name: '月収', exact: true });
  await input.click();
  await focused(input);
  await userEvent.keyboard('{Enter}');
  expect(submit).not.toHaveBeenCalled();
  await focused(input);
  await value(input, '2');
  await validity(true);
  // Prove the surrounding form can submit when its button is used.
  await page.getByRole('button', { name: '続ける', exact: true }).click();
  expect(submit).toHaveBeenCalledTimes(1);
});

it('focuses the count on yes and restores its value after toggling no', async () => {
  const assign = vi.fn();
  await render(
    <TestProviders>
      <PersonNumQuestionTemplate
        title="子ども"
        assignFunc={assign}
        maxPersonNum={5}
        initialValue={{ type: 'PersonNum', selection: 2 }}
      />
      <QuestionValidity />
    </TestProviders>
  );
  const input = page.getByRole('textbox');
  await value(input, '2');
  await validity(true);
  await page.getByRole('button', { name: 'いいえ', exact: true }).click();
  await expect
    .poll(() => assign.mock.lastCall)
    .toEqual([{ type: 'PersonNum', selection: 0 }]);
  await page.getByRole('button', { name: 'はい', exact: true }).click();
  await focused(input);
  await value(input, '2');
  expect(assign).toHaveBeenLastCalledWith({ type: 'PersonNum', selection: 2 });
  await userEvent.keyboard('{ArrowUp}');
  await value(input, '3');
  expect(assign).toHaveBeenLastCalledWith({ type: 'PersonNum', selection: 3 });
  await userEvent.keyboard('{ArrowDown}');
  await value(input, '2');
  expect(assign).toHaveBeenLastCalledWith({ type: 'PersonNum', selection: 2 });
  await validity(true);
});
