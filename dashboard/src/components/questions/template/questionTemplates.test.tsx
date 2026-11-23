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
    '年齢が %s のとき、%i に正規化しクリア後は無効になる',
    { tags: ['input:boundary', 'input:empty'] },
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
    '金額が %s のとき、%i 万円に正規化しクリア後は無効になる',
    { tags: ['input:boundary', 'input:empty'] },
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
    '子の年齢が %s のとき、%i に正規化しクリア後は無効になる',
    { tags: ['input:boundary', 'input:empty'] },
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
    '学校が $school で学年が $year のとき、年齢を換算し上限を越えると学校が変わる',
    { tags: ['input:boundary', 'input:empty'] },
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
  ])(
    '日付が %s のとき、7歳の学年が年度に対応する',
    { tags: ['input:normal'] },
    (date, year) => {
      vi.setSystemTime(date);
      renderWithValidity(
        <ChildrenAgeQuestionTemplate
          assignFunc={vi.fn()}
          initialValue={initialAnswers.childrenAge}
        />
      );
      expect(screen.getByRole('combobox')).toHaveValue('小学校');
      expect(screen.getAllByRole('textbox')[1]).toHaveValue(year);
    }
  );

  it(
    '復元した学年で学校を変えると年齢が変わり、学年だけ消すと年齢を保つ',
    { tags: ['input:normal'] },
    () => {
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
    }
  );

  it.each([
    ['２', 2, '2', true],
    ['5', 5, '5', true],
    ['6', 5, '5', true],
    ['0', 0, '', false],
  ])(
    '人数が %s のとき、上限と有効性が対応する',
    { tags: ['input:boundary', 'input:empty'] },
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
    '初期値が %j のとき、人数をクリアし再入力すると有効性が直ちに変わる',
    { tags: ['input:empty', 'transition:restore'] },
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

  it(
    '再描画したとき、前の回答とDOMを引き継がない',
    { tags: ['input:normal'] },
    () => {
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
    }
  );
});
