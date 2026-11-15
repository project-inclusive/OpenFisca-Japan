// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { AgeQuestionTemplate } from './ageQuestionTemplate';
import { AmountOfMoneyQuestionTemplate } from './amountOfMoneyQuestionTemplate';
import { ChildrenAgeQuestionTemplate } from './childrenAgeQuestionTemplate';
import { PersonNumQuestionTemplate } from './personNumQuestionTemplate';
import { QuestionValidity, TestProviders } from './questionTemplateTestUtils';

const device = vi.hoisted(() => ({
  isWindows: false,
  isChrome: false,
  isChromium: false,
  isEdge: false,
  isSafari: false,
  isMobile: false,
}));

// The library computes its exported flags at import time. Keep React/Recoil
// mounted normally and vary only those flags, using the real UA parser.
vi.mock('react-device-detect', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-device-detect')>()),
  get isWindows() {
    return device.isWindows;
  },
  get isChrome() {
    return device.isChrome;
  },
  get isChromium() {
    return device.isChromium;
  },
  get isEdge() {
    return device.isEdge;
  },
  get isSafari() {
    return device.isSafari;
  },
  get isMobile() {
    return device.isMobile;
  },
}));

const windows = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
const mac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
const webkit = 'AppleWebKit/537.36 (KHTML, like Gecko)';
const chrome = 'Chrome/130.0.0.0 Safari/537.36';
const profiles = [
  {
    name: 'Windows Chrome',
    ua: `${windows} ${webkit} ${chrome}`,
    suppress: true,
  },
  {
    name: 'Windows Edge',
    ua: `${windows} ${webkit} ${chrome} Edg/130.0.0.0`,
    suppress: true,
  },
  {
    name: 'Windows Chromium',
    ua: `${windows} ${webkit} Chromium/130.0.0.0 Safari/537.36`,
    suppress: true,
  },
  {
    name: 'macOS Safari',
    ua: `${mac} AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15`,
    suppress: true,
  },
  {
    name: 'Windows Firefox',
    ua: `${windows} Gecko/20100101 Firefox/132.0`,
    suppress: false,
  },
  { name: 'macOS Chrome', ua: `${mac} ${webkit} ${chrome}`, suppress: false },
  {
    name: 'iPhone Safari',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    suppress: true,
    mobile: true,
  },
  {
    name: 'Android Chrome',
    ua: `Mozilla/5.0 (Linux; Android 14; Pixel 8) ${webkit} ${chrome} Mobile`,
    suppress: false,
    mobile: true,
  },
];

const templates = [
  { name: 'age', type: 'Age', label: '年齢' },
  { name: 'money', type: 'AmountOfMoney', label: '月収' },
  { name: 'child age', type: 'Age', label: '年齢' },
  { name: 'person count', type: 'PersonNum', label: undefined },
] as const;
type Template = (typeof templates)[number];

const mount = (template: Template, selection?: number) => {
  const assign = vi.fn();
  const age =
    selection === undefined ? undefined : { type: 'Age' as const, selection };
  render(
    <TestProviders>
      {template.name === 'age' && (
        <AgeQuestionTemplate assignFunc={assign} initialValue={age} />
      )}
      {template.name === 'money' && (
        <AmountOfMoneyQuestionTemplate
          title="月収"
          assignFunc={assign}
          initialValue={
            selection === undefined
              ? undefined
              : { type: 'AmountOfMoney', selection, unit: '万円' }
          }
        />
      )}
      {template.name === 'child age' && (
        <ChildrenAgeQuestionTemplate assignFunc={assign} initialValue={age} />
      )}
      {template.name === 'person count' && (
        <PersonNumQuestionTemplate
          title="子ども"
          assignFunc={assign}
          maxPersonNum={5}
          initialValue={
            selection === undefined
              ? undefined
              : { type: 'PersonNum', selection }
          }
        />
      )}
      <QuestionValidity />
    </TestProviders>
  );
  return {
    assign,
    input: screen.getByRole(
      device.isMobile ? 'spinbutton' : 'textbox',
      template.label ? { name: template.label } : {}
    ),
  };
};
const answer = (template: Template, selection: number) => ({
  type: template.type,
  selection,
  ...(template.name === 'money' ? { unit: '万円' } : {}),
});
const validity = (valid: boolean) =>
  expect(screen.getByRole('status')).toHaveTextContent(String(valid));

beforeEach(() => {
  Object.keys(device).forEach((key) => {
    device[key as keyof typeof device] = false;
  });
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 0, 15, 12));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe.each(profiles)('$name', (profile) => {
  beforeEach(() => {
    const selectors = getSelectorsByUserAgent(profile.ua) as typeof device;
    Object.keys(device).forEach((key) => {
      device[key as keyof typeof device] =
        selectors[key as keyof typeof device];
    });
  });

  it.each(templates)('renders the $name input attributes', (template) => {
    const { input } = mount(template, template.name === 'child age' ? 7 : 2);
    const mobile = 'mobile' in profile && profile.mobile;
    expect(input).toHaveAttribute('type', mobile ? 'number' : 'text');
    if (mobile) expect(input).toHaveAttribute('pattern', '[0-9]*');
    else expect(input).not.toHaveAttribute('pattern');
    // These templates use type/pattern rather than an inputmode override.
    expect(input).not.toHaveAttribute('inputmode');
    if (template.name === 'child age') {
      const year = screen.getAllByRole(mobile ? 'spinbutton' : 'textbox')[1];
      expect(year).toHaveAttribute('type', mobile ? 'number' : 'text');
      if (mobile) expect(year).toHaveAttribute('pattern', '[0-9]*');
      else expect(year).not.toHaveAttribute('pattern');
      expect(year).not.toHaveAttribute('inputmode');
    }
  });

  // Numeric mobile inputs cannot contain full-width digits. Exercise IME text
  // events on desktop inputs, without inventing an impossible number value.
  if (!('mobile' in profile)) {
    if (profile.suppress) {
      it.each(templates)(
        'keeps unanswered $name invalid until composition commits',
        (template) => {
          const { input, assign } = mount(template);
          fireEvent.compositionStart(input);
          fireEvent.input(input, {
            target: { value: '３' },
            data: '３',
            inputType: 'insertCompositionText',
            isComposing: true,
          });
          expect(input).toHaveValue('');
          validity(false);
          expect(
            assign.mock.calls.every(([value]) => value.selection === undefined)
          ).toBe(true);
          assign.mockClear();
          fireEvent.compositionEnd(input, { data: '３' });
          fireEvent.input(input, {
            target: { value: '３' },
            data: '３',
            isComposing: false,
          });
          expect(input).toHaveValue('3');
          expect(assign).toHaveBeenCalledExactlyOnceWith(answer(template, 3));
          validity(true);
        }
      );
    }

    it.each(templates)(
      'handles composing and committed $name input',
      (template) => {
        const { input, assign } = mount(template, 2);
        validity(true);
        expect(assign).not.toHaveBeenCalled();
        fireEvent.compositionStart(input);
        fireEvent.input(input, {
          target: { value: '３' },
          data: '３',
          inputType: 'insertCompositionText',
          isComposing: true,
        });
        expect(input).toHaveValue(profile.suppress ? '2' : '3');
        if (profile.suppress) {
          // Age and money restore the old answer; count simply ignores the event.
          expect(
            assign.mock.calls.every(([value]) => value.selection === 2)
          ).toBe(true);
        } else expect(assign).toHaveBeenLastCalledWith(answer(template, 3));
        validity(true);
        assign.mockClear();
        fireEvent.compositionEnd(input, { data: '３' });
        fireEvent.input(input, {
          target: { value: '３' },
          data: '３',
          inputType: 'insertText',
          isComposing: false,
        });
        expect(input).toHaveValue('3');
        if (profile.suppress) {
          expect(assign).toHaveBeenCalledExactlyOnceWith(answer(template, 3));
        }
        validity(true);
      }
    );

    it('keeps the school year and derived age stable during suppressed composition', () => {
      const { input: age, assign } = mount(templates[2], 7);
      const year = screen.getAllByRole('textbox')[1];
      expect(year).toHaveValue('1');
      fireEvent.compositionStart(year);
      fireEvent.input(year, {
        target: { value: '２' },
        data: '２',
        inputType: 'insertCompositionText',
        isComposing: true,
      });
      expect(year).toHaveValue(profile.suppress ? '1' : '2');
      expect(age).toHaveValue(profile.suppress ? '7' : '8');
      if (profile.suppress) expect(assign).not.toHaveBeenCalled();
      else
        expect(assign).toHaveBeenLastCalledWith({ type: 'Age', selection: 8 });
      assign.mockClear();
      fireEvent.compositionEnd(year, { data: '２' });
      fireEvent.input(year, {
        target: { value: '２' },
        data: '２',
        isComposing: false,
      });
      expect(year).toHaveValue('2');
      expect(age).toHaveValue('8');
      if (profile.suppress)
        expect(assign).toHaveBeenCalledExactlyOnceWith({
          type: 'Age',
          selection: 8,
        });
      validity(true);
    });

    it.each(templates)(
      'accepts $name changes delivered without InputEvent',
      (template) => {
        const { input, assign } = mount(template);
        fireEvent.change(input, { target: { value: '３' } });
        expect(input).toHaveValue('3');
        expect(assign).toHaveBeenLastCalledWith(answer(template, 3));
        validity(true);
      }
    );
  }
});

describe('restored answers and clearing', () => {
  it.each(templates)('starts unanswered $name as invalid', (template) => {
    const { input, assign } = mount(template);
    expect(input).toHaveValue('');
    validity(false);
    expect(assign).not.toHaveBeenCalled();
  });

  for (const selection of [0, 2]) {
    it.each(templates)(
      'restores $name with selection ' + selection,
      (template) => {
        const { input, assign } = mount(template, selection);
        expect(input).toHaveValue(String(selection));
        validity(true);
        expect(assign).not.toHaveBeenCalled();
      }
    );
  }

  it.each(templates.slice(0, 3))(
    'invalidates restored $name after clearing and accepts zero again',
    (template) => {
      const { input, assign } = mount(template, 2);
      validity(true);
      fireEvent.change(input, { target: { value: '' } });
      expect(input).toHaveValue('');
      validity(false);
      fireEvent.change(input, { target: { value: '0' } });
      expect(input).toHaveValue('0');
      expect(assign).toHaveBeenLastCalledWith(answer(template, 0));
      validity(true);
    }
  );

  it.fails(
    'invalidates a restored person count as soon as it is cleared',
    () => {
      const { input, assign } = mount(templates[3], 2);
      validity(true);
      fireEvent.change(input, { target: { value: '' } });
      expect(input).toHaveValue('');
      expect(assign).toHaveBeenLastCalledWith(answer(templates[3], 0));
      validity(false);
    }
  );

  it.fails(
    'validates a person count re-entered after confirming an empty yes answer',
    () => {
      const { input, assign } = mount(templates[3], 2);
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.click(screen.getByRole('button', { name: 'はい' }));
      validity(false);
      fireEvent.change(input, { target: { value: '3' } });
      expect(input).toHaveValue('3');
      expect(assign).toHaveBeenLastCalledWith(answer(templates[3], 3));
      validity(true);
    }
  );

  it.fails(
    'validates a count typed after choosing yes on an unanswered form',
    () => {
      const { input, assign } = mount(templates[3]);
      fireEvent.click(screen.getByRole('button', { name: 'はい' }));
      validity(false);
      fireEvent.change(input, { target: { value: '2' } });
      expect(input).toHaveValue('2');
      expect(assign).toHaveBeenLastCalledWith(answer(templates[3], 2));
      validity(true);
    }
  );

  it('accepts no without a count and requires a count when yes is selected again', () => {
    const { input, assign } = mount(templates[3]);
    fireEvent.click(screen.getByRole('button', { name: 'はい' }));
    validity(false);
    fireEvent.click(screen.getByRole('button', { name: 'いいえ' }));
    validity(true);
    expect(assign).toHaveBeenLastCalledWith(answer(templates[3], 0));
    fireEvent.click(screen.getByRole('button', { name: 'はい' }));
    expect(input).toHaveValue('');
    validity(false);
  });
});
