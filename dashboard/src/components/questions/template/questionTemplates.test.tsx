// @vitest-environment jsdom
import { ReactElement } from 'react';
import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AddressQuestionTemplate } from './addressQuestionTemplate';
import { AgeQuestionTemplate } from './ageQuestionTemplate';
import { AmountOfMoneyQuestionTemplate } from './amountOfMoneyQuestionTemplate';
import { ChildrenAgeQuestionTemplate } from './childrenAgeQuestionTemplate';
import { MultipleSelectionQuestionTemplate } from './multipleSelectionQuestionTemplate';
import { PersonNumQuestionTemplate } from './personNumQuestionTemplate';
import { SelectionQuestionTemplate } from './selectionQuestionTemplate';
import { YesNoQuestionTemplate } from './yesNoQuestionTemplate';
import {
  buttonBackground,
  initialAnswers,
  initialMultipleAnswer,
  multipleChoices,
  QuestionValidity,
  questionChoices,
  renderQuestion,
  schoolYearCases,
} from './questionTemplateTestUtils';

const renderWithValidity = (ui: ReactElement) =>
  renderQuestion(
    <>
      {ui}
      <QuestionValidity />
    </>
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

  it('assigns an address and resets the city and its options on prefecture changes', async () => {
    const user = userEvent.setup();
    const assign = vi.fn();
    renderWithValidity(<AddressQuestionTemplate assignFunc={assign} />);
    const prefecture = screen.getByTestId('select-prefecture');
    const city = screen.getByTestId('select-city');
    expect(prefecture).toHaveValue('');
    expect(city).toHaveValue('');
    expectValidity(false);
    await user.selectOptions(prefecture, '東京都');
    expect(assign).toHaveBeenLastCalledWith({
      type: 'Address',
      prefecure: '東京都',
      municipality: '',
    });
    expectValidity(false);
    await user.selectOptions(city, '千代田区');
    expect(assign).toHaveBeenLastCalledWith(initialAnswers.address);
    expect(city).toHaveValue('千代田区');
    expectValidity(true);
    await user.selectOptions(city, '');
    expectValidity(false);
    await user.selectOptions(city, '千代田区');
    await user.selectOptions(prefecture, '大阪府');
    expect(city).toHaveValue('');
    expect(within(city).queryByRole('option', { name: '千代田区' })).toBeNull();
    expect(
      within(city).getByRole('option', { name: '大阪市' })
    ).toBeInTheDocument();
    expect(assign).toHaveBeenLastCalledWith({
      type: 'Address',
      prefecure: '大阪府',
      municipality: '',
    });
    expectValidity(false);
    await user.selectOptions(prefecture, '');
    expect(assign).toHaveBeenLastCalledWith({
      type: 'Address',
      prefecure: '',
      municipality: '',
    });
    expect(within(city).getAllByRole('option')).toHaveLength(1);
    expectValidity(false);
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

  it('keeps age non-negative when decreasing zero with the keyboard', () => {
    const assign = vi.fn();
    renderWithValidity(
      <AgeQuestionTemplate
        assignFunc={assign}
        initialValue={initialAnswers.age}
      />
    );
    fireEvent.keyDown(screen.getByLabelText('年齢'), { key: 'ArrowDown' });
    expect(screen.getByLabelText('年齢')).toHaveValue('0');
    expect(assign).toHaveBeenLastCalledWith(initialAnswers.age);
    expectValidity(true);
  });

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

  it('toggles multiple answers, deselects the last answer and resets all with none', async () => {
    const user = userEvent.setup();
    const assign = vi.fn();
    renderWithValidity(
      <MultipleSelectionQuestionTemplate
        title="症状"
        selections={multipleChoices}
        assignFunc={assign}
      />
    );
    expectValidity(true);
    expectSelected('病気がある', false);
    await user.click(screen.getByRole('button', { name: '病気がある' }));
    expect(assign).toHaveBeenLastCalledWith({
      type: 'MultipleSelection',
      selection: ['病気がある'],
    });
    expectSelected('病気がある', true);
    await user.click(screen.getByRole('button', { name: '障害がある' }));
    expect(assign).toHaveBeenLastCalledWith({
      type: 'MultipleSelection',
      selection: [...multipleChoices],
    });
    await user.click(screen.getByRole('button', { name: '病気がある' }));
    expect(assign).toHaveBeenLastCalledWith({
      type: 'MultipleSelection',
      selection: ['障害がある'],
    });
    expectSelected('病気がある', false);
    await user.click(screen.getByRole('button', { name: '障害がある' }));
    expect(assign).toHaveBeenLastCalledWith({
      type: 'MultipleSelection',
      selection: [],
    });
    expectSelected('いずれでもない', true);
    await user.click(screen.getByRole('button', { name: '病気がある' }));
    await user.click(screen.getByRole('button', { name: '障害がある' }));
    await user.click(screen.getByRole('button', { name: 'いずれでもない' }));
    expect(assign).toHaveBeenLastCalledWith({
      type: 'MultipleSelection',
      selection: [],
    });
    for (const choice of multipleChoices) expectSelected(choice, false);
    expectSelected('いずれでもない', true);
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

  it('switches the person count between no, yes, and an empty count', async () => {
    const user = userEvent.setup();
    const assign = vi.fn();
    renderWithValidity(
      <PersonNumQuestionTemplate
        title="子ども"
        assignFunc={assign}
        maxPersonNum={5}
      />
    );
    await user.click(screen.getByRole('button', { name: 'はい' }));
    expectValidity(false);
    await user.click(screen.getByRole('button', { name: 'いいえ' }));
    expect(assign).toHaveBeenLastCalledWith({
      type: 'PersonNum',
      selection: 0,
    });
    expectValidity(true);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '2' } });
    expectValidity(true);
    await user.click(screen.getByRole('button', { name: 'いいえ' }));
    expectSelected('いいえ', true);
    expect(assign).toHaveBeenLastCalledWith({
      type: 'PersonNum',
      selection: 0,
    });
    await user.click(screen.getByRole('button', { name: 'はい' }));
    expectSelected('はい', true);
    expect(assign).toHaveBeenLastCalledWith({
      type: 'PersonNum',
      selection: 2,
    });
    await user.clear(screen.getByRole('textbox'));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(assign).toHaveBeenLastCalledWith({
      type: 'PersonNum',
      selection: 0,
    });
    // Current implementation recalculates validity when the yes button is clicked.
    expectValidity(true);
    await user.click(screen.getByRole('button', { name: 'はい' }));
    expectValidity(false);
  });

  it('updates a single selection, its display and its answer', async () => {
    const user = userEvent.setup();
    const assign = vi.fn();
    renderWithValidity(
      <SelectionQuestionTemplate
        title="仕事"
        selections={questionChoices}
        assignFunc={assign}
      />
    );
    expectValidity(false);
    for (const choice of questionChoices) expectSelected(choice, false);
    for (const choice of questionChoices) {
      await user.click(screen.getByRole('button', { name: choice }));
      expect(assign).toHaveBeenLastCalledWith({
        type: 'Selection',
        selection: choice,
      });
      for (const option of questionChoices)
        expectSelected(option, option === choice);
      expectValidity(true);
    }
  });

  it('reflects both yes/no answers and their selected state', async () => {
    const user = userEvent.setup();
    const assign = vi.fn();
    renderWithValidity(
      <YesNoQuestionTemplate
        title="現在仕事をしていますか？"
        assignFunc={assign}
      />
    );
    expectValidity(false);
    expectSelected('はい', false);
    expectSelected('いいえ', false);
    await user.click(screen.getByRole('button', { name: 'はい' }));
    expect(assign).toHaveBeenLastCalledWith({
      type: 'Boolean',
      selection: true,
    });
    expectSelected('はい', true);
    expectSelected('いいえ', false);
    expectValidity(true);
    await user.click(screen.getByRole('button', { name: 'いいえ' }));
    expect(assign).toHaveBeenLastCalledWith({
      type: 'Boolean',
      selection: false,
    });
    expectSelected('はい', false);
    expectSelected('いいえ', true);
    expectValidity(true);
  });

  it('restores an address without notifying a new answer on mount', () => {
    const assign = vi.fn();
    renderWithValidity(
      <AddressQuestionTemplate
        assignFunc={assign}
        initialValue={initialAnswers.address}
      />
    );
    expect(screen.getByTestId('select-prefecture')).toHaveValue('東京都');
    expect(screen.getByTestId('select-city')).toHaveValue('千代田区');
    expectValidity(true);
    expect(assign).not.toHaveBeenCalled();
  });

  it('restores zero money as a valid answer', () => {
    renderWithValidity(
      <AmountOfMoneyQuestionTemplate
        title="月収"
        assignFunc={vi.fn()}
        initialValue={initialAnswers.money}
      />
    );
    expect(screen.getByTestId('amount-input')).toHaveValue('0');
    expectValidity(true);
  });

  it('restores selected multiple answers', () => {
    renderWithValidity(
      <MultipleSelectionQuestionTemplate
        title="症状"
        selections={multipleChoices}
        assignFunc={vi.fn()}
        initialValue={initialMultipleAnswer}
      />
    );
    expectSelected('病気がある', true);
    expectSelected('障害がある', false);
    expectValidity(true);
  });

  it('restores a positive person count and the yes selection', () => {
    renderWithValidity(
      <PersonNumQuestionTemplate
        title="子ども"
        assignFunc={vi.fn()}
        maxPersonNum={5}
        initialValue={initialAnswers.personNum}
      />
    );
    expect(screen.getByRole('textbox')).toHaveValue('2');
    expectSelected('はい', true);
    expectValidity(true);
  });

  it('restores a single selection', () => {
    renderWithValidity(
      <SelectionQuestionTemplate
        title="仕事"
        selections={questionChoices}
        assignFunc={vi.fn()}
        initialValue={initialAnswers.selection}
      />
    );
    expectSelected('会社員', false);
    expectSelected('自営業', true);
    expectValidity(true);
  });

  it('restores false as a valid boolean answer', () => {
    renderWithValidity(
      <YesNoQuestionTemplate
        title="現在仕事をしていますか？"
        assignFunc={vi.fn()}
        initialValue={initialAnswers.yesNo}
      />
    );
    expectSelected('はい', false);
    expectSelected('いいえ', true);
    expectValidity(true);
  });

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
