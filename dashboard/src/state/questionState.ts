import { assign, setup, type StateValueFrom } from 'xstate';
import {
  QuestionAnswer,
  QuestionAnswers,
  QuestionKey,
  questionKeys,
} from './questionDefinition';
import { HouseholdMember } from './household';

export type QuestionHistory = {
  key: QuestionKey;
  member: HouseholdMember;
};

// 各質問の回答を保持するコンテキスト
export type QuestionStateContext = QuestionAnswers & {
  // 現在質問対象になっている世帯員
  currentMember: HouseholdMember;
  // 過去の選択肢の履歴
  histories: QuestionHistory[];
};

type QuestionAssignEventMap = {
  [T in QuestionKey]: {
    type: T;
    value: QuestionAnswer[T];
  };
};

type QuestionAssignEvent = QuestionAssignEventMap[QuestionKey];

export type QuestionEvent =
  | QuestionAssignEvent
  | { type: 'next' }
  | { type: 'back' };

export type QustionState = StateValueFrom<typeof questionStateMachine>;

// 各状態に対する遷移先を定義
const actionObj = <Key extends QuestionKey>({
  questionKey,
  nextQuestionKey,
  nextConditions,
  hasBack,
}: {
  questionKey: Key;
  nextQuestionKey: QuestionKey | 'result';
  nextConditions: {
    target: QuestionKey;
    guard: ({ context }: { context: QuestionStateContext }) => boolean;
  }[];
  hasBack: boolean;
}) => {
  // 特定の条件で分岐する遷移先
  const nextActions = nextConditions.map((cond) => ({
    ...cond,
    // NOTE: assignの型推論が効かないため、明示的に型を指定
    actions: assign<
      QuestionStateContext,
      { type: 'next' },
      undefined,
      QuestionEvent,
      never
    >({
      // backでこの質問に戻ってこれるよう、この質問を履歴に追加
      histories: ({ context }: { context: QuestionStateContext }) => [
        ...context.histories,
        {
          key: questionKey,
          member: context.currentMember,
        },
      ],
    }),
  }));

  return {
    // 質問と同名のイベント: 選択肢の保存
    [questionKey]: {
      actions: assign<
        QuestionStateContext,
        QuestionAssignEventMap[Key],
        undefined,
        QuestionEvent,
        never
      >({
        [questionKey]: ({
          event,
          context,
        }: {
          event: QuestionAssignEvent;
          context: QuestionStateContext;
        }) => {
          // HACK: context[questionKey]は全世帯員の情報を含むため、現在参照している世帯員の属性のみを更新して返す
          // （破壊的変更を含まないようコピーしたオブジェクトを操作）
          const answers = structuredClone(context[questionKey]);
          const member = context.currentMember;
          answers[member.relationship][member.index] = event.value;

          //return event.value;
          return answers;
        },
      }),
    },
    // next: 次の状態（質問）へ遷移
    next: [
      //特定の条件で分岐する遷移先
      ...nextActions,
      // 該当しない場合はデフォルトの遷移先
      {
        target: nextQuestionKey,
        actions: assign<
          QuestionStateContext,
          { type: 'next' },
          undefined,
          QuestionEvent,
          never
        >({
          // backでこの質問に戻ってこれるよう、この質問を履歴に追加
          histories: ({ context }: { context: QuestionStateContext }) => [
            ...context.histories,
            {
              key: questionKey,
              member: context.currentMember,
            },
          ],
        }),
      },
    ],
    // back: 前の状態（質問）へ遷移
    // NOTE: 前の状態が存在しない場合(hasback === false)は遷移しない
    back: hasBack
      ? {
          target: 'history',
        }
      : undefined,
  };
};

// 質問の状態を管理するステートマシン
export const questionStateMachine = setup({
  types: {} as {
    events: QuestionEvent;
    context: QuestionStateContext;
  },
}).createMachine({
  id: 'question',
  // 最初の状態（質問）
  initial: '住んでいる場所',
  // 各質問で選んだ選択肢の初期値（選択前のため、デフォルトで0または最初の選択肢を設定している）
  context: {
    住んでいる場所: {
      あなた: [
        {
          type: 'Address',
          prefecure: '',
          municipality: '',
        },
      ],
      配偶者: [],
      子ども: [],
      親: [],
    },
    年齢: {
      あなた: [
        {
          type: 'Age',
          selection: undefined,
        },
      ],
      配偶者: [],
      子ども: [],
      親: [],
    },
    年収: {
      あなた: [
        {
          type: 'AmountOfMoney',
          selection: undefined,
          unit: '万円',
        },
      ],
      配偶者: [],
      子ども: [],
      親: [],
    },
    預貯金: {
      あなた: [
        {
          type: 'AmountOfMoney',
          selection: undefined,
          unit: '万円',
        },
      ],
      配偶者: [],
      子ども: [],
      親: [],
    },
    仕事: {
      あなた: [
        {
          type: 'Selection',
          selection: undefined,
        },
      ],
      配偶者: [],
      子ども: [],
      親: [],
    },
    家を借りたい: {
      あなた: [
        {
          type: 'Boolean',
          selection: undefined,
        },
      ],
      配偶者: [],
      子ども: [],
      親: [],
    },
    // 質問は「あなた」についてのものから始める
    currentMember: { relationship: 'あなた', index: 0 },
    histories: [],
  },
  // 各質問を状態として定義
  // 現在どの質問が聞かれているかを表す
  states: {
    住んでいる場所: {
      on: actionObj<'住んでいる場所'>({
        questionKey: '住んでいる場所',
        nextQuestionKey: '年齢',
        nextConditions: [],
        hasBack: false,
      }),
    },
    年齢: {
      on: actionObj<'年齢'>({
        questionKey: '年齢',
        nextQuestionKey: '年収',
        nextConditions: [],
        hasBack: true,
      }),
    },
    年収: {
      on: actionObj<'年収'>({
        questionKey: '年収',
        nextQuestionKey: '預貯金',
        nextConditions: [],
        hasBack: true,
      }),
    },
    預貯金: {
      on: actionObj<'預貯金'>({
        questionKey: '預貯金',
        nextQuestionKey: '仕事',
        nextConditions: [],
        hasBack: true,
      }),
    },
    仕事: {
      on: actionObj<'仕事'>({
        questionKey: '仕事',
        nextQuestionKey: '家を借りたい',
        nextConditions: [],
        hasBack: true,
      }),
    },
    家を借りたい: {
      on: actionObj<'家を借りたい'>({
        questionKey: '家を借りたい',
        nextQuestionKey: 'result',
        nextConditions: [],
        hasBack: true,
      }),
    },
    // TODO: 各世帯員に対する質問終了のダミー状態を作成
    // 即時次の世帯員へ遷移（誰に遷移するか、人数の範囲外チェック等の責務を持たせる）
    // 最後の状態（結果表示）
    // NOTE: type "final" は使わない（状態遷移が完了しbackで戻れなくなるため）
    result: {
      on: {
        back: {
          target: 'history',
        },
      },
    },
    // 履歴を使って前の状態に戻るための仮状態
    // NOTE: xstateでは状態遷移時に動的にtargetを決定できないため、このような形で実装している
    // histories配列を使用して直前の状態（質問）を特定しそこへ遷移する
    history: {
      // alwaysを使用しそのまま直前の状態へ遷移
      always: questionKeys.map((key) => ({
        target: key,
        guard: ({ context }: { context: QuestionStateContext }) =>
          context.histories[context.histories.length - 1].key === key,
      })),
      // 状態を抜ける際に必ず実行
      exit: assign({
        // 直前の状態（質問）を履歴から削除
        histories: ({ context }: { context: QuestionStateContext }) =>
          context.histories.slice(0, -1),
        // 直前の状態（質問）に対応する世帯員をcurrentMemberに設定
        currentMember: ({ context }: { context: QuestionStateContext }) => {
          const lastHistory = context.histories[context.histories.length - 1];
          return lastHistory.member;
        },
      }),
    },
  },
});
