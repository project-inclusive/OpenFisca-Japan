import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { AddressQuestionTemplate } from './addressQuestionTemplate';
import { AgeQuestionTemplate } from './ageQuestionTemplate';
import { AmountOfMoneyQuestionTemplate } from './amountOfMoneyQuestionTemplate';
import { ChildrenAgeQuestionTemplate } from './childrenAgeQuestionTemplate';
import { MultipleSelectionQuestionTemplate } from './multipleSelectionQuestionTemplate';
import { PersonNumQuestionTemplate } from './personNumQuestionTemplate';
import { SelectionQuestionTemplate } from './selectionQuestionTemplate';
import { YesNoQuestionTemplate } from './yesNoQuestionTemplate';
import {
  initialAnswers,
  initialMultipleAnswer,
  multipleChoices,
  questionChoices,
  QuestionValidity,
  TestProviders,
} from './questionTemplateTestUtils';

const meta = {
  title: 'Questions/Templates',
  args: { assignFunc: fn() },
  decorators: [
    (Story) => (
      <TestProviders>
        <Story />
        <QuestionValidity />
      </TestProviders>
    ),
  ],
  render: (args) => <AgeQuestionTemplate {...args} />,
} satisfies Meta<{ assignFunc: ReturnType<typeof fn> }>;
export default meta;
type Story = StoryObj<typeof meta>;

const click = async (button: HTMLElement) => {
  await userEvent.click(button);
  // Hover uses the selected color too. Move away before checking selection.
  await userEvent.unhover(button);
};
const selected = async (button: HTMLElement, value: boolean) => {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue(
      value ? '--chakra-colors-cyan-600' : '--chakra-colors-white'
    )
    .trim();
  await waitFor(() => expect(button).toHaveStyle({ backgroundColor: color }));
};

export const Address: Story = {
  render: (args) => <AddressQuestionTemplate {...args} />,
  play: async ({ canvas, args }) => {
    const prefecture = canvas.getByTestId('select-prefecture');
    const city = canvas.getByTestId('select-city');
    const valid = canvas.getByTestId('question-validity');
    await expect(prefecture).toHaveValue('');
    await expect(city).toHaveValue('');
    await expect(valid).toHaveTextContent('false');
    await userEvent.selectOptions(prefecture, '東京都');
    await expect(args.assignFunc).toHaveBeenLastCalledWith({
      ...initialAnswers.address,
      municipality: '',
    });
    await expect(valid).toHaveTextContent('false');
    await userEvent.selectOptions(city, '千代田区');
    await expect(args.assignFunc).toHaveBeenLastCalledWith(
      initialAnswers.address
    );
    await expect(city).toHaveValue('千代田区');
    await expect(valid).toHaveTextContent('true');
    await userEvent.selectOptions(city, '');
    await expect(valid).toHaveTextContent('false');
    await userEvent.selectOptions(city, '千代田区');
    await userEvent.selectOptions(prefecture, '大阪府');
    await expect(city).toHaveValue('');
    await expect(
      canvas.queryByRole('option', { name: '千代田区' })
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('option', { name: '大阪市' })
    ).toBeInTheDocument();
    await expect(args.assignFunc).toHaveBeenLastCalledWith({
      type: 'Address',
      prefecure: '大阪府',
      municipality: '',
    });
    await expect(valid).toHaveTextContent('false');
    await userEvent.selectOptions(prefecture, '');
    await expect(args.assignFunc).toHaveBeenLastCalledWith({
      type: 'Address',
      prefecure: '',
      municipality: '',
    });
    await expect(city.children).toHaveLength(1);
    await expect(valid).toHaveTextContent('false');
  },
};
export const RestoredAddress: Story = {
  render: (args) => (
    <AddressQuestionTemplate {...args} initialValue={initialAnswers.address} />
  ),
  play: async ({ canvas, args }) => {
    await expect(canvas.getByTestId('select-prefecture')).toHaveValue('東京都');
    await expect(canvas.getByTestId('select-city')).toHaveValue('千代田区');
    await expect(canvas.getByTestId('question-validity')).toHaveTextContent(
      'true'
    );
    await expect(args.assignFunc).not.toHaveBeenCalled();
  },
};
export const RestoredAge: Story = {
  render: (args) => (
    <AgeQuestionTemplate {...args} initialValue={initialAnswers.age} />
  ),
};
export const RestoredMoney: Story = {
  render: (args) => (
    <AmountOfMoneyQuestionTemplate
      {...args}
      title="月収"
      initialValue={initialAnswers.money}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('amount-input')).toHaveValue('0');
    await expect(canvas.getByTestId('question-validity')).toHaveTextContent(
      'true'
    );
  },
};
export const RestoredChildAge: Story = {
  render: (args) => (
    <ChildrenAgeQuestionTemplate
      {...args}
      initialValue={initialAnswers.childrenAge}
    />
  ),
};
export const MultipleSelection: Story = {
  render: (args) => (
    <MultipleSelectionQuestionTemplate
      {...args}
      title="症状"
      selections={multipleChoices}
    />
  ),
  play: async ({ canvas, args }) => {
    const button = (name: string) => canvas.getByRole('button', { name });
    const valid = canvas.getByTestId('question-validity');
    await expect(valid).toHaveTextContent('true');
    await selected(button('病気がある'), false);
    await click(button('病気がある'));
    await expect(args.assignFunc).toHaveBeenLastCalledWith({
      type: 'MultipleSelection',
      selection: ['病気がある'],
    });
    await selected(button('病気がある'), true);
    await click(button('障害がある'));
    await expect(args.assignFunc).toHaveBeenLastCalledWith({
      type: 'MultipleSelection',
      selection: [...multipleChoices],
    });
    await click(button('病気がある'));
    await expect(args.assignFunc).toHaveBeenLastCalledWith({
      type: 'MultipleSelection',
      selection: ['障害がある'],
    });
    await selected(button('病気がある'), false);
    await click(button('障害がある'));
    await expect(args.assignFunc).toHaveBeenLastCalledWith({
      type: 'MultipleSelection',
      selection: [],
    });
    await selected(button('いずれでもない'), true);
    await click(button('病気がある'));
    await click(button('障害がある'));
    await click(button('いずれでもない'));
    await expect(args.assignFunc).toHaveBeenLastCalledWith({
      type: 'MultipleSelection',
      selection: [],
    });
    for (const choice of multipleChoices) await selected(button(choice), false);
    await selected(button('いずれでもない'), true);
    await expect(valid).toHaveTextContent('true');
  },
};
export const RestoredMultipleSelection: Story = {
  render: (args) => (
    <MultipleSelectionQuestionTemplate
      {...args}
      title="症状"
      selections={multipleChoices}
      initialValue={initialMultipleAnswer}
    />
  ),
  play: async ({ canvas }) => {
    await selected(canvas.getByRole('button', { name: '病気がある' }), true);
    await selected(canvas.getByRole('button', { name: '障害がある' }), false);
    await expect(canvas.getByTestId('question-validity')).toHaveTextContent(
      'true'
    );
  },
};
export const PersonCount: Story = {
  render: (args) => (
    <PersonNumQuestionTemplate {...args} title="子ども" maxPersonNum={5} />
  ),
  play: async ({ canvas, args }) => {
    const yes = canvas.getByRole('button', { name: 'はい' });
    const no = canvas.getByRole('button', { name: 'いいえ' });
    const input = canvas.getByRole('textbox');
    const valid = canvas.getByTestId('question-validity');
    await click(yes);
    await expect(input).toHaveFocus();
    await expect(valid).toHaveTextContent('false');
    await click(no);
    await expect(args.assignFunc).toHaveBeenLastCalledWith({
      type: 'PersonNum',
      selection: 0,
    });
    await expect(valid).toHaveTextContent('true');
    await userEvent.type(input, '2');
    await expect(valid).toHaveTextContent('true');
    await click(no);
    await selected(no, true);
    await expect(args.assignFunc).toHaveBeenLastCalledWith({
      type: 'PersonNum',
      selection: 0,
    });
    await click(yes);
    await selected(yes, true);
    await expect(args.assignFunc).toHaveBeenLastCalledWith(
      initialAnswers.personNum
    );
    await userEvent.clear(input);
    await expect(input).toHaveValue('');
    await expect(args.assignFunc).toHaveBeenLastCalledWith({
      type: 'PersonNum',
      selection: 0,
    });
    await selected(yes, true);
    await expect(valid).toHaveTextContent('false');
    await userEvent.type(input, '2');
    await expect(args.assignFunc).toHaveBeenLastCalledWith(
      initialAnswers.personNum
    );
    await expect(valid).toHaveTextContent('true');
  },
};
export const RestoredPersonCount: Story = {
  render: (args) => (
    <PersonNumQuestionTemplate
      {...args}
      title="子ども"
      maxPersonNum={5}
      initialValue={initialAnswers.personNum}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox')).toHaveValue('2');
    await selected(canvas.getByRole('button', { name: 'はい' }), true);
    await expect(canvas.getByTestId('question-validity')).toHaveTextContent(
      'true'
    );
  },
};
export const Selection: Story = {
  render: (args) => (
    <SelectionQuestionTemplate
      {...args}
      title="仕事"
      selections={questionChoices}
    />
  ),
  play: async ({ canvas, args }) => {
    await expect(canvas.getByTestId('question-validity')).toHaveTextContent(
      'false'
    );
    for (const choice of questionChoices)
      await selected(canvas.getByRole('button', { name: choice }), false);
    for (const choice of questionChoices) {
      await click(canvas.getByRole('button', { name: choice }));
      await expect(args.assignFunc).toHaveBeenLastCalledWith({
        type: 'Selection',
        selection: choice,
      });
      for (const option of questionChoices)
        await selected(
          canvas.getByRole('button', { name: option }),
          option === choice
        );
      await expect(canvas.getByTestId('question-validity')).toHaveTextContent(
        'true'
      );
    }
  },
};
export const RestoredSelection: Story = {
  render: (args) => (
    <SelectionQuestionTemplate
      {...args}
      title="仕事"
      selections={questionChoices}
      initialValue={initialAnswers.selection}
    />
  ),
  play: async ({ canvas }) => {
    await selected(canvas.getByRole('button', { name: '会社員' }), false);
    await selected(canvas.getByRole('button', { name: '自営業' }), true);
    await expect(canvas.getByTestId('question-validity')).toHaveTextContent(
      'true'
    );
  },
};
export const YesNo: Story = {
  render: (args) => (
    <YesNoQuestionTemplate {...args} title="現在仕事をしていますか？" />
  ),
  play: async ({ canvas, args }) => {
    const yes = canvas.getByRole('button', { name: 'はい' });
    const no = canvas.getByRole('button', { name: 'いいえ' });
    const valid = canvas.getByTestId('question-validity');
    await expect(valid).toHaveTextContent('false');
    await selected(yes, false);
    await selected(no, false);
    await click(yes);
    await expect(args.assignFunc).toHaveBeenLastCalledWith({
      type: 'Boolean',
      selection: true,
    });
    await selected(yes, true);
    await selected(no, false);
    await expect(valid).toHaveTextContent('true');
    await expect(yes).toHaveFocus();
    await userEvent.tab();
    await expect(no).toHaveFocus();
    await userEvent.keyboard(' ');
    await userEvent.unhover(yes);
    await expect(args.assignFunc).toHaveBeenLastCalledWith(
      initialAnswers.yesNo
    );
    await selected(yes, false);
    await selected(no, true);
    await expect(valid).toHaveTextContent('true');
  },
};
export const RestoredYesNo: Story = {
  render: (args) => (
    <YesNoQuestionTemplate
      {...args}
      title="現在仕事をしていますか？"
      initialValue={initialAnswers.yesNo}
    />
  ),
  play: async ({ canvas }) => {
    await selected(canvas.getByRole('button', { name: 'はい' }), false);
    await selected(canvas.getByRole('button', { name: 'いいえ' }), true);
    await expect(canvas.getByTestId('question-validity')).toHaveTextContent(
      'true'
    );
  },
};
