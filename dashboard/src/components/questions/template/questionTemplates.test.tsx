// @vitest-environment jsdom
import { ReactElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgeQuestionTemplate } from './ageQuestionTemplate';
import { AmountOfMoneyQuestionTemplate } from './amountOfMoneyQuestionTemplate';
import { ChildrenAgeQuestionTemplate } from './childrenAgeQuestionTemplate';
import { PersonNumQuestionTemplate } from './personNumQuestionTemplate';
import {
  buttonBackground,
  initialAnswers,
  QuestionValidity,
  TestProviders,
  schoolYearCases,
} from './questionTemplateTestUtils';

const renderWithValidity = (ui: ReactElement) =>
  render(
    <TestProviders>
      {ui}
      <QuestionValidity />
    </TestProviders>
  );
const expectValidity = (valid: boolean) =>
  expect(screen.getByTestId('question-validity')).toHaveTextContent(
    String(valid)
  );
const expectSelected = (name: string, selected: boolean) =>
  expect(buttonBackground(screen.getByRole('button', { name }))).toBe(
    selected ? 'var(--chakra-colors-cyan-600)' : 'var(--chakra-colors-white)'
  );

describe('question templates', () => {
  beforeEach(() => {
    // Only fake Date; Chakra and user-event keep their real timers.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 0, 15, 12));
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it.each([
    ['１２', 12],
    ['0', 0],
    ['200', 200],
    ['201', 200],
  ])(
    'normalizes age %s to %i and invalidates a cleared answer',
    (raw, expected) => {
      const assign = vi.fn();
      renderWithValidity(<AgeQuestionTemplate assignFunc={assign} />);
      const input = screen.getByLabelText('年齢');
      expect(input).toHaveValue('');
      expectValidity(false);
      fireEvent.change(input, { target: { value: raw } });
      expect(input).toHaveValue(String(expected));
      expect(assign).toHaveBeenLastCalledWith({
        type: 'Age',
        selection: expected,
      });
      expectValidity(true);
      fireEvent.change(input, { target: { value: '' } });
      expect(input).toHaveValue('');
      expectValidity(false);
    }
  );

  it.each([
    ['１２', 12],
    ['0', 0],
    ['1000000', 1000000],
    ['1000001', 0],
  ])(
    'normalizes money %s to %i万円 and invalidates a cleared answer',
    (raw, expected) => {
      const assign = vi.fn();
      renderWithValidity(
        <AmountOfMoneyQuestionTemplate title="月収" assignFunc={assign} />
      );
      const input = screen.getByTestId('amount-input');
      expect(input).toHaveValue('');
      expectValidity(false);
      fireEvent.change(input, { target: { value: raw } });
      expect(input).toHaveValue(String(expected));
      expect(assign).toHaveBeenLastCalledWith({
        type: 'AmountOfMoney',
        selection: expected,
        unit: '万円',
      });
      expectValidity(true);
      fireEvent.change(input, { target: { value: '' } });
      expect(input).toHaveValue('');
      expectValidity(false);
    }
  );

  it.each([
    ['７', 7],
    ['0', 0],
    ['200', 200],
    ['201', 200],
  ])(
    'normalizes child age %s to %i and invalidates a cleared answer',
    (raw, expected) => {
      const assign = vi.fn();
      renderWithValidity(<ChildrenAgeQuestionTemplate assignFunc={assign} />);
      const input = screen.getAllByRole('textbox')[0];
      expect(input).toHaveValue('');
      expectValidity(false);
      fireEvent.change(input, { target: { value: raw } });
      expect(input).toHaveValue(String(expected));
      expect(assign).toHaveBeenLastCalledWith({
        type: 'Age',
        selection: expected,
      });
      expectValidity(true);
      fireEvent.change(input, { target: { value: '' } });
      expect(input).toHaveValue('');
      expectValidity(false);
    }
  );

  it.each(schoolYearCases)(
    'converts $school year $year and crosses its upper boundary',
    ({ school, year, age, nextSchool }) => {
      const assign = vi.fn();
      renderWithValidity(<ChildrenAgeQuestionTemplate assignFunc={assign} />);
      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: school },
      });
      expectValidity(false);
      const yearInput = screen.getAllByRole('textbox')[1];
      fireEvent.change(yearInput, { target: { value: '１' } });
      expect(assign).toHaveBeenLastCalledWith({
        type: 'Age',
        selection: age - Number(year) + 1,
      });
      fireEvent.change(yearInput, { target: { value: year } });
      expect(assign).toHaveBeenLastCalledWith({ type: 'Age', selection: age });
      expect(screen.getAllByRole('textbox')[0]).toHaveValue(String(age));
      expect(yearInput).toHaveValue(year);
      expectValidity(true);
      fireEvent.change(yearInput, {
        target: { value: String(Number(year) + 1) },
      });
      expect(assign).toHaveBeenLastCalledWith({
        type: 'Age',
        selection: age + 1,
      });
      expect(screen.getByRole('combobox')).toHaveValue(nextSchool);
    }
  );

  it.each([
    [new Date(2026, 0, 15, 12), '1'],
    [new Date(2026, 3, 15, 12), '2'],
  ])('reflects the school year for age seven on %s', (date, year) => {
    vi.setSystemTime(date);
    renderWithValidity(
      <ChildrenAgeQuestionTemplate
        assignFunc={vi.fn()}
        initialValue={initialAnswers.childrenAge}
      />
    );
    expect(screen.getByRole('combobox')).toHaveValue('小学校');
    expect(screen.getAllByRole('textbox')[1]).toHaveValue(year);
  });

  it('changes school with an existing year and keeps age when only the year is cleared', () => {
    const assign = vi.fn();
    renderWithValidity(
      <ChildrenAgeQuestionTemplate
        assignFunc={assign}
        initialValue={initialAnswers.childrenAge}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '中学校' },
    });
    expect(assign).toHaveBeenLastCalledWith({ type: 'Age', selection: 13 });
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('13');
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('1');
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: '' },
    });
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('');
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('13');
    expectValidity(true);
  });

  it.each([
    ['２', 2, '2', true],
    ['5', 5, '5', true],
    ['6', 5, '5', true],
    ['0', 0, '', false],
  ])(
    'handles person count %s at the input boundary',
    (raw, expected, shown, valid) => {
      const assign = vi.fn();
      renderWithValidity(
        <PersonNumQuestionTemplate
          title="子ども"
          assignFunc={assign}
          maxPersonNum={5}
        />
      );
      expectValidity(false);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: raw } });
      expect(assign).toHaveBeenLastCalledWith({
        type: 'PersonNum',
        selection: expected,
      });
      expect(screen.getByRole('textbox')).toHaveValue(shown);
      expectSelected('はい', true);
      expectValidity(valid);
    }
  );

  it.each([undefined, initialAnswers.personNum])(
    'updates person count validity immediately when clearing and re-entering with initial answer %j',
    (initialValue) => {
      const assign = vi.fn();
      renderWithValidity(
        <PersonNumQuestionTemplate
          title="子ども"
          assignFunc={assign}
          maxPersonNum={5}
          initialValue={initialValue}
        />
      );
      const input = screen.getByRole('textbox', { name: '人数' });
      fireEvent.click(screen.getByRole('button', { name: 'はい' }));
      fireEvent.change(input, { target: { value: '3' } });
      expectValidity(true);

      fireEvent.change(input, { target: { value: '' } });
      expect(input).toHaveValue('');
      expect(assign).toHaveBeenLastCalledWith({
        type: 'PersonNum',
        selection: 0,
      });
      expectSelected('はい', true);
      expectValidity(false);

      fireEvent.change(input, { target: { value: '2' } });
      expect(assign).toHaveBeenLastCalledWith(initialAnswers.personNum);
      expectValidity(true);

      fireEvent.change(input, { target: { value: '' } });
      expectValidity(false);
      fireEvent.click(screen.getByRole('button', { name: 'いいえ' }));
      expectValidity(true);
    }
  );

  it('isolates Recoil state and DOM between fresh renders', () => {
    const first = renderWithValidity(
      <AgeQuestionTemplate
        assignFunc={vi.fn()}
        initialValue={initialAnswers.age}
      />
    );
    expectValidity(true);
    first.unmount();
    renderWithValidity(<AgeQuestionTemplate assignFunc={vi.fn()} />);
    expect(screen.getByLabelText('年齢')).toHaveValue('');
    expectValidity(false);
  });
});
