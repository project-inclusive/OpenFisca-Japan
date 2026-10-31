import { ReactElement } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import { useRecoilValue, RecoilRoot, MutableSnapshot } from 'recoil';
import { questionValidatedAtom } from '../../../state';
import { MultipleSelectionQuestion } from '../../../state/questionDefinition';

export const renderWithProviders = (
  ui: ReactElement,
  initializeState?: (snapshot: MutableSnapshot) => void
) =>
  render(
    <RecoilRoot initializeState={initializeState}>
      <ChakraProvider>{ui}</ChakraProvider>
    </RecoilRoot>
  );

export const renderQuestion = renderWithProviders;

export const questionChoices = ['会社員', '自営業'] as const;
export const multipleChoices = ['病気がある', '障害がある'] as const;

export const initialAnswers = {
  address: { type: 'Address', prefecure: '東京都', municipality: '千代田区' },
  age: { type: 'Age', selection: 0 },
  money: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  childrenAge: { type: 'Age', selection: 7 },
  personNum: { type: 'PersonNum', selection: 2 },
  selection: { type: 'Selection', selection: '自営業' },
  yesNo: { type: 'Boolean', selection: false },
} as const;

export const initialMultipleAnswer: MultipleSelectionQuestion<'病気やけが、障害はありますか？'> =
  {
    type: 'MultipleSelection',
    selection: ['病気がある'],
  };

// Fix the calendar explicitly in tests: school year conversion changes in April.
export const schoolYearCases = [
  { school: '小学校', year: '6', age: 12, nextSchool: '中学校' },
  { school: '中学校', year: '3', age: 15, nextSchool: '高等学校' },
  { school: '高等学校', year: '3', age: 18, nextSchool: '高校卒業後相当' },
] as const;

export const QuestionValidity = () => {
  const valid = useRecoilValue(questionValidatedAtom);
  return <output data-testid="question-validity">{String(valid)}</output>;
};

// jsdom does not resolve Chakra's CSS variables in computed backgrounds.
// Read the rule applied to the rendered class, without hard-coding Emotion hashes.
export const buttonBackground = (button: HTMLElement) => {
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      if (
        rule instanceof CSSStyleRule &&
        Array.from(button.classList).some(
          (className) => rule.selectorText === `.${className}`
        )
      ) {
        const background = rule.style.getPropertyValue('background');
        if (background) return background;
      }
    }
  }
  throw new Error('No background rule found for button');
};
