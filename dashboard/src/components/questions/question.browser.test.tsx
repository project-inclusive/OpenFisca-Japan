import { afterEach, describe, expect, it } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-react';
import { createActor, ActorRefFrom } from 'xstate';
import { useSelector } from '@xstate/react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Question } from './question';
import { TestProviders } from './template/questionTemplateTestUtils';
import { QuestionEvent, questionStateMachine } from '../../state/questionState';
import {
  currentDateAtom,
  frontendHouseholdAtom,
  householdAtom,
} from '../../state';
import { OpenFiscaHousehold } from '../../state/convert';
import { SelectionQuestion } from '../../state/questionDefinition';

type Actor = ActorRefFrom<typeof questionStateMachine>;
type Answer = Exclude<QuestionEvent, { type: 'next' | 'back' | 'reset' }>;
type Mode = NonNullable<SelectionQuestion<'見積もりモード'>['selection']>;
const date = '2026-01-15';
const actors: Actor[] = [];
const originalUrl = window.location.href;

afterEach(async () => {
  await cleanup();
  actors.splice(0).forEach((actor) => actor.stop());
  window.history.replaceState(null, '', originalUrl);
});

const start = (mode: Mode = 'くわしく見積もり') => {
  const actor = createActor(questionStateMachine).start();
  actors.push(actor);
  actor.send({
    type: '見積もりモード',
    value: { type: 'Selection', selection: mode },
  });
  actor.send({ type: 'next' });
  return actor;
};

// Reach the fixture through real transitions, without inventing a snapshot or
// replaying the consent-to-result flow already covered by E2E tests.
const answer = (actor: Actor, event: Answer) => {
  expect(actor.getSnapshot().value).toBe(event.type);
  actor.send(event);
  actor.send({ type: 'next' });
};
const atSpouse = (mode: Mode) => {
  const actor = start(mode);
  answer(actor, {
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '千代田区' },
  });
  if (mode !== 'かんたん見積もり') {
    answer(actor, { type: '年齢', value: { type: 'Age', selection: 36 } });
  }
  if (mode === '地震被災者支援制度見積もり') {
    answer(actor, {
      type: '被災前の年収',
      value: { type: 'AmountOfMoney', selection: 345, unit: '万円' },
    });
    for (const type of [
      '住宅が被害を受けていますか？',
      '家財の３分の１以上の損害が発生しましたか？',
      '災害により負傷し、1ヶ月以上療養を続けていますか？',
      '災害によって、精神または身体に重い障害がありますか？',
    ] as const) {
      answer(actor, { type, value: { type: 'Boolean', selection: false } });
    }
    answer(actor, {
      type: '家族に災害で亡くなった方はいますか？',
      value: { type: 'PersonNum', selection: 0 },
    });
  } else {
    answer(actor, {
      type: '年収',
      value: { type: 'AmountOfMoney', selection: 123, unit: '万円' },
    });
    if (mode === 'くわしく見積もり') {
      answer(actor, {
        type: '預貯金',
        value: { type: 'AmountOfMoney', selection: 45, unit: '万円' },
      });
      answer(actor, {
        type: '現在仕事をしていますか？',
        value: { type: 'Boolean', selection: false },
      });
      answer(actor, {
        type: '病気やけが、障害はありますか？',
        value: { type: 'MultipleSelection', selection: [] },
      });
      for (const type of [
        '介護施設に入所していますか？',
        '高校、大学、専門学校、職業訓練学校等の学生ですか？',
        '家を借りたいですか？',
      ] as const) {
        answer(actor, { type, value: { type: 'Boolean', selection: false } });
      }
      answer(actor, {
        type: '妊娠中、または産後6ヵ月以内ですか？',
        value: { type: 'Selection', selection: 'いいえ' },
      });
      answer(actor, {
        type: '困りごとはありますか？',
        value: { type: 'MultipleSelection', selection: ['仕事について'] },
      });
    }
  }
  expect(actor.getSnapshot().value).toBe('配偶者はいますか？');
  return actor;
};

const LiveQuestion = ({ actor }: { actor: Actor }) => {
  const state = useSelector(actor, (snapshot) => snapshot);
  return <Question state={state} send={actor.send} />;
};

// Observe the actual destination's Recoil values and navigation payload. The
// backend request and result rendering belong to the existing E2E tests.
const SavedResult = () => {
  const location = useLocation();
  const household = useRecoilValue(householdAtom) as OpenFiscaHousehold;
  const frontendHousehold = useRecoilValue(frontendHouseholdAtom);
  return (
    <output aria-label="保存された回答">
      {JSON.stringify({
        pathname: location.pathname,
        navigation: location.state,
        household,
        frontendHousehold,
      })}
    </output>
  );
};

const mount = async (actor: Actor, path = '/calculate') => {
  // Question reads the browser pathname when setting the calculation flags.
  // A real BrowserRouter keeps that pathname and the router location in sync.
  window.history.replaceState(null, '', path);
  await render(
    <TestProviders initializeState={({ set }) => set(currentDateAtom, date)}>
      <BrowserRouter>
        <Routes>
          <Route path={path} element={<LiveQuestion actor={actor} />} />
          <Route path="/result" element={<SavedResult />} />
        </Routes>
      </BrowserRouter>
    </TestProviders>
  );
};
const next = () =>
  page.getByRole('button', { name: '次へ', exact: true }).click();
const back = () =>
  page.getByRole('button', { name: '前へ', exact: true }).click();
const choice = (name: string) =>
  page.getByRole('button', { name, exact: true }).click();
const hasValue = (locator: Locator, expected: string) =>
  expect
    .poll(
      () =>
        (locator.query() as HTMLInputElement | HTMLSelectElement | null)?.value
    )
    .toBe(expected);
const shown = (text: string) =>
  expect
    .poll(
      () => page.getByText(text, { exact: true }).query()?.checkVisibility()
    )
    .toBe(true);
const noError = () =>
  expect.poll(() => page.getByText('入力必須項目です').query()).toBeNull();

describe('question screen connected to the state machine', () => {
  it('blocks missing and partial answers, advances, and restores answers on back', async () => {
    const actor = start();
    await mount(actor);
    await expect
      .poll(
        () =>
          (
            page
              .getByRole('button', { name: '前へ' })
              .query() as HTMLButtonElement | null
          )?.disabled
      )
      .toBe(true);
    await next();
    await shown('入力必須項目です');
    await shown('寝泊まりしている地域');
    expect(actor.getSnapshot().value).toBe('寝泊まりしている地域');

    const prefecture = page.getByRole('combobox').nth(0);
    const city = page.getByRole('combobox').nth(1);
    await prefecture.selectOptions('東京都');
    await next();
    await shown('入力必須項目です');
    expect(actor.getSnapshot().value).toBe('寝泊まりしている地域');
    await city.selectOptions('千代田区');
    await next();
    await shown('年齢');
    await noError();
    await hasValue(page.getByRole('textbox', { name: '年齢' }), '');
    await next();
    await shown('入力必須項目です');
    expect(actor.getSnapshot().value).toBe('年齢');
    await page.getByRole('textbox', { name: '年齢' }).fill('36');
    await next();
    await shown('年収');
    await noError();
    await back();
    await hasValue(page.getByRole('textbox', { name: '年齢' }), '36');
    await back();
    await hasValue(prefecture, '東京都');
    await hasValue(city, '千代田区');
    await next();
    await hasValue(page.getByRole('textbox', { name: '年齢' }), '36');
  });

  it('switches spouse, child and parent forms when household answers change', async () => {
    const actor = atSpouse('くわしく見積もり');
    await mount(actor);
    await choice('はい');
    await next();
    await shown('配偶者について');
    await hasValue(page.getByRole('textbox', { name: '年齢' }), '');
    await expect
      .poll(() => page.getByText('学年', { exact: true }).query())
      .toBeNull();
    await back();
    await choice('いいえ');
    await next();
    await shown('子どもの人数');
    await page.getByRole('textbox').fill('1');
    await next();
    await shown('子ども（1人目）について');
    await shown('学年');
    await page.getByRole('textbox', { name: '年齢', exact: true }).fill('7');
    await next();
    await shown('高校に通っていますか？');
    await back();
    await hasValue(
      page.getByRole('textbox', { name: '年齢', exact: true }),
      '7'
    );
    await back();
    await shown('子どもの人数');
    await hasValue(page.getByRole('textbox'), '1');
    await choice('いいえ');
    await next();
    await shown('親の人数');
    await page.getByRole('textbox').fill('1');
    await next();
    await shown('親（1人目）について');
    await hasValue(page.getByRole('textbox', { name: '年齢' }), '');
    await expect
      .poll(() => page.getByText('学年', { exact: true }).query())
      .toBeNull();
    await page.getByRole('textbox', { name: '年齢' }).fill('70');
    await next();
    await shown('年収');
    await back();
    await hasValue(page.getByRole('textbox', { name: '年齢' }), '70');
  });

  it('isolates answers between children and restores each member on back', async () => {
    const actor = atSpouse('かんたん見積もり');
    await mount(actor, '/calculate-simple');
    await choice('はい');
    await next();
    await shown('配偶者について');
    await shown('年収');
    await hasValue(page.getByRole('textbox'), '');
    await page.getByRole('textbox').fill('50');
    await next();
    await shown('子どもの人数');
    await back();
    await shown('配偶者について');
    await hasValue(page.getByRole('textbox'), '50');
    await back();
    await choice('いいえ');
    await next();
    await shown('子どもの人数');
    await page.getByRole('textbox').fill('2');
    await next();
    await shown('子ども（1人目）について');
    await page.getByRole('textbox', { name: '年齢', exact: true }).fill('7');
    await next();
    await shown('子ども（2人目）について');
    await hasValue(
      page.getByRole('textbox', { name: '年齢', exact: true }),
      ''
    );
    await next();
    await shown('入力必須項目です');
    await page.getByRole('textbox', { name: '年齢', exact: true }).fill('10');
    await back();
    await shown('子ども（1人目）について');
    await noError();
    await hasValue(
      page.getByRole('textbox', { name: '年齢', exact: true }),
      '7'
    );
    await next();
    await shown('子ども（2人目）について');
    await hasValue(
      page.getByRole('textbox', { name: '年齢', exact: true }),
      '10'
    );
  });

  it.each([
    {
      mode: 'かんたん見積もり',
      path: '/calculate-simple',
      last: '子どもの人数',
      simple: true,
      disaster: false,
    },
    {
      mode: 'くわしく見積もり',
      path: '/calculate',
      last: '親の人数',
      simple: false,
      disaster: false,
    },
    {
      mode: '地震被災者支援制度見積もり',
      path: '/calculate-disaster',
      last: '親の人数',
      simple: false,
      disaster: true,
    },
  ] as const)(
    'saves both households and navigates after the last question in $mode',
    async ({ mode, path, last, simple, disaster }) => {
      const actor = atSpouse(mode);
      answer(actor, {
        type: '配偶者はいますか？',
        value: { type: 'Boolean', selection: false },
      });
      if (!simple) {
        answer(actor, {
          type: '子どもの人数',
          value: { type: 'PersonNum', selection: 0 },
        });
      }
      await mount(actor, path);
      await shown(last);
      await next();
      await shown('入力必須項目です');
      expect(window.location.pathname).toBe(path);
      await choice('いいえ');
      await next();
      const output = page.getByRole('status', { name: '保存された回答' });
      await expect.poll(() => output.query()?.isConnected).toBe(true);
      const saved = JSON.parse(output.element().textContent ?? '') as {
        pathname: string;
        navigation: {
          household: OpenFiscaHousehold;
          isSimpleCalculation: boolean;
          isDisasterCalculation: boolean;
        };
        household: OpenFiscaHousehold;
        frontendHousehold: { 制度: Record<string, boolean> };
      };
      expect(window.location.pathname).toBe('/result');
      expect(saved.pathname).toBe('/result');
      expect(saved.navigation).toEqual({
        household: saved.household,
        isSimpleCalculation: simple,
        isDisasterCalculation: disaster,
      });
      expect(Object.keys(saved.household.世帯員)).toEqual(['あなた']);
      expect(saved.household.世帯一覧.世帯1).toMatchObject({
        親一覧: ['あなた'],
        子一覧: [],
        居住都道府県: { [date]: '東京都' },
        居住市区町村: { [date]: '千代田区' },
      });
      if (disaster) {
        expect(saved.household.世帯員.あなた).toMatchObject({
          収入: { [date]: 3450000 },
        });
        expect(saved.household.世帯一覧.世帯1).toMatchObject({
          被災している: { [date]: true },
        });
      } else {
        expect(saved.household.世帯員.あなた).toMatchObject({
          収入: { [date]: 1230000 },
        });
      }
      if (mode === 'くわしく見積もり') {
        expect(saved.household.世帯員.あなた).toMatchObject({
          預貯金: { [date]: 450000 },
        });
        expect(saved.frontendHousehold.制度['雇用保険（失業手当）']).toBe(true);
      } else {
        expect(saved.frontendHousehold.制度).toEqual({});
      }
    }
  );
});
