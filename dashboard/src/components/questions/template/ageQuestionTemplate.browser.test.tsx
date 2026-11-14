import { expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { AgeQuestionTemplate } from './ageQuestionTemplate';
import {
  initialAnswers,
  QuestionValidity,
  TestProviders,
} from './questionTemplateTestUtils';

it('focuses age and keeps zero non-negative with a real keyboard', async () => {
  const assign = vi.fn();
  await render(
    <TestProviders>
      <AgeQuestionTemplate
        assignFunc={assign}
        initialValue={initialAnswers.age}
      />
      <QuestionValidity />
    </TestProviders>
  );
  const input = page.getByRole('textbox');
  await input.click();
  await expect
    .poll(() => document.activeElement === input.element())
    .toBe(true);
  await userEvent.keyboard('{ArrowDown}');
  await expect
    .poll(() => (input.element() as HTMLInputElement).value)
    .toBe('0');
  expect(assign).toHaveBeenLastCalledWith(initialAnswers.age);
  await expect
    .poll(() => page.getByTestId('question-validity').element().textContent)
    .toBe('true');
});
