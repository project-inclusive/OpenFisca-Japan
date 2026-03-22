import { assign, setup, type StateValueFrom } from 'xstate';
import {
  BooleanQuestion,
  BooleanQuestionKey,
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
  // HACK: QuestionAssignEventを直接指定するとUnion型推論上限の26プロパティを超えてしまうため、BooleanQuestionのみ分離している
  | Exclude<QuestionAssignEvent, { type: BooleanQuestionKey }>
  | { type: BooleanQuestionKey; value: BooleanQuestion }
  | { type: 'next' }
  | { type: 'back' };

export type QustionState = StateValueFrom<typeof questionStateMachine>;

export type ChangeMemberKey =
  | 'changeToSpouse'
  | 'changeToChild'
  | 'changeToSelfChildrenNum'
  | 'changeToSelfParentNum'
  | 'changeToNextChild'
  | 'changeToParent'
  | 'changeToNextParent';

// 各状態に対する遷移先を定義
const actionObj = <Key extends QuestionKey>({
  questionKey,
  nextQuestionKey,
  nextConditions,
  hasBack,
}: {
  questionKey: Key;
  nextQuestionKey: QuestionKey | ChangeMemberKey | 'result';
  nextConditions: {
    target: QuestionKey | ChangeMemberKey | 'result';
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

// 病気がある・けがをしているが選択されているかを判定するガード
const hasIllnessOrInjury = ({ context }: { context: QuestionStateContext }) => {
  const member = context.currentMember;
  const selection =
    context['病気やけが、障害はありますか？'][member.relationship][member.index]
      .selection;
  return (
    selection.includes('病気がある') || selection.includes('けがをしている')
  );
};

// 障害があるが選択されているかを判定するガード
const hasDisability = ({ context }: { context: QuestionStateContext }) => {
  const member = context.currentMember;
  return context['病気やけが、障害はありますか？'][member.relationship][
    member.index
  ].selection.includes('障害がある');
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
  initial: '寝泊まりしている地域',
  // 各質問で選んだ選択肢の初期値
  context: {
    寝泊まりしている地域: {
      あなた: [{ type: 'Address', prefecure: '', municipality: '' }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    年齢: {
      あなた: [{ type: 'Age', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    年収: {
      あなた: [{ type: 'AmountOfMoney', selection: undefined, unit: '万円' }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    預貯金: {
      あなた: [{ type: 'AmountOfMoney', selection: undefined, unit: '万円' }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '現在仕事をしていますか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    仕事: {
      あなた: [{ type: 'Selection', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '6か月以内に新しい仕事を始めましたか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '休職中ですか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '休職中に給与の支払いがない状態ですか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '病気やけが、障害はありますか？': {
      あなた: [{ type: 'MultipleSelection', selection: [] }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '業務によって病気やけがをしましたか？': {
      あなた: [{ type: 'MultipleSelection', selection: [] }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '病気やけがによって連続3日以上休業していますか？': {
      あなた: [{ type: 'MultipleSelection', selection: [] }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '入院中ですか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '感染症にかかっていますか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    'HIVに感染していますか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    'エイズを発症していますか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '家族に血液製剤によってHIVに感染した方はいますか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '血液製剤の投与によってHIVに感染しましたか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    'C型肝炎に感染していますか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '腎不全ですか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '慢性腎不全ですか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '人工透析を行っていますか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '先天性の血液凝固因子異常症（血友病等）ですか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '血液凝固因子異常症のうち、当てはまるものはどれですか？': {
      あなた: [{ type: 'MultipleSelection', selection: [] }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '身体障害者手帳を持っていますか？': {
      あなた: [{ type: 'Selection', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '精神障害者保健福祉手帳を持っていますか？': {
      あなた: [{ type: 'Selection', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '療育手帳、または愛の手帳を持っていますか？': {
      あなた: [{ type: 'Selection', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '放射線障害がありますか？': {
      あなた: [{ type: 'Selection', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '内部障害（内臓などのからだの内部の障害）がありますか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '脳性まひ、または進行性筋萎縮症ですか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '介護施設に入所していますか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '高校、大学、専門学校、職業訓練学校等の学生ですか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '家を借りたいですか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '妊娠中、または産後6ヵ月以内ですか？': {
      あなた: [{ type: 'Selection', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '困りごとはありますか？': {
      あなた: [{ type: 'MultipleSelection', selection: [] }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '配偶者はいますか？': {
      あなた: [{ type: 'Boolean', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    子どもの人数: {
      あなた: [{ type: 'PersonNum', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    親の人数: {
      あなた: [{ type: 'PersonNum', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '以下のいずれかに当てはまりますか？': {
      あなた: [],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '高校に通っていますか？': {
      あなた: [],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '通っている高校の種類を選んでください（1）': {
      あなた: [],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '通っている高校の種類を選んでください（2）': {
      あなた: [],
      配偶者: [],
      子ども: [],
      親: [],
    },
    // 質問は「あなた」についてのものから始める
    currentMember: { relationship: 'あなた', index: 0 },
    histories: [],
  },
  // 各質問を状態として定義
  states: {
    寝泊まりしている地域: {
      on: actionObj<'寝泊まりしている地域'>({
        questionKey: '寝泊まりしている地域',
        nextQuestionKey: '年齢',
        nextConditions: [],
        hasBack: false,
      }),
    },
    年齢: {
      on: actionObj<'年齢'>({
        questionKey: '年齢',
        nextQuestionKey: '年収',
        nextConditions: [
          {
            // 子どもは仕事をしている場合のみ年収を聞けばよいため、先に高校の質問へ進む
            target: '高校に通っていますか？',
            guard: ({ context }) => {
              return context.currentMember.relationship === '子ども';
            },
          },
        ],
        hasBack: true,
      }),
    },
    年収: {
      on: actionObj<'年収'>({
        questionKey: '年収',
        nextQuestionKey: '預貯金',
        nextConditions: [
          // 子どもについては仕事関連の質問の途中で年収を聞くため、仕事についての次の質問へ進む
          {
            target: '仕事',
            guard: ({ context }) => {
              return context.currentMember.relationship === '子ども';
            },
          },
        ],
        hasBack: true,
      }),
    },
    預貯金: {
      on: actionObj<'預貯金'>({
        questionKey: '預貯金',
        nextQuestionKey: '現在仕事をしていますか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '現在仕事をしていますか？': {
      on: actionObj<'現在仕事をしていますか？'>({
        questionKey: '現在仕事をしていますか？',
        nextQuestionKey: '仕事',
        nextConditions: [
          {
            // 仕事していない場合、仕事関連の質問をスキップ
            target: '病気やけが、障害はありますか？',
            guard: ({ context }) => {
              const member = context.currentMember;
              return (
                context['現在仕事をしていますか？'][member.relationship][
                  member.index
                ].selection === false
              );
            },
          },
          {
            // 子どもは仕事をしている場合のみ年収を聞く
            target: '年収',
            guard: ({ context }) => {
              const member = context.currentMember;
              const working =
                context['現在仕事をしていますか？'][member.relationship][
                  member.index
                ].selection === true;
              return member.relationship === '子ども' && working;
            },
          },
        ],
        hasBack: true,
      }),
    },
    仕事: {
      on: actionObj<'仕事'>({
        questionKey: '仕事',
        nextQuestionKey: '6か月以内に新しい仕事を始めましたか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '6か月以内に新しい仕事を始めましたか？': {
      on: actionObj<'6か月以内に新しい仕事を始めましたか？'>({
        questionKey: '6か月以内に新しい仕事を始めましたか？',
        nextQuestionKey: '休職中ですか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '休職中ですか？': {
      on: actionObj<'休職中ですか？'>({
        questionKey: '休職中ですか？',
        nextQuestionKey: '休職中に給与の支払いがない状態ですか？',
        nextConditions: [
          {
            // 休業していない場合、休業関連の質問をスキップ
            target: '病気やけが、障害はありますか？',
            guard: ({ context }) => {
              const member = context.currentMember;
              return (
                context['休職中ですか？'][member.relationship][member.index]
                  .selection === false
              );
            },
          },
        ],
        hasBack: true,
      }),
    },
    '休職中に給与の支払いがない状態ですか？': {
      on: actionObj<'休職中に給与の支払いがない状態ですか？'>({
        questionKey: '休職中に給与の支払いがない状態ですか？',
        nextQuestionKey: '病気やけが、障害はありますか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '病気やけが、障害はありますか？': {
      on: actionObj<'病気やけが、障害はありますか？'>({
        questionKey: '病気やけが、障害はありますか？',
        nextQuestionKey: '業務によって病気やけがをしましたか？',
        nextConditions: [
          {
            // 障害のみ選択の場合、身体障害者手帳へスキップ
            target: '身体障害者手帳を持っていますか？',
            guard: ({ context }) =>
              !hasIllnessOrInjury({ context }) && hasDisability({ context }),
          },
          {
            // 何も選択しない場合、介護施設へスキップ
            target: '介護施設に入所していますか？',
            guard: ({ context }) =>
              !hasIllnessOrInjury({ context }) && !hasDisability({ context }),
          },
        ],
        hasBack: true,
      }),
    },
    '業務によって病気やけがをしましたか？': {
      on: actionObj<'業務によって病気やけがをしましたか？'>({
        questionKey: '業務によって病気やけがをしましたか？',
        nextQuestionKey: '病気やけがによって連続3日以上休業していますか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '病気やけがによって連続3日以上休業していますか？': {
      on: actionObj<'病気やけがによって連続3日以上休業していますか？'>({
        questionKey: '病気やけがによって連続3日以上休業していますか？',
        nextQuestionKey: '入院中ですか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '入院中ですか？': {
      on: actionObj<'入院中ですか？'>({
        questionKey: '入院中ですか？',
        nextQuestionKey:
          '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？': {
      on: actionObj<'在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'>(
        {
          questionKey:
            '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
          nextQuestionKey: '感染症にかかっていますか？',
          nextConditions: [
            {
              // 在宅療養中でなく病気もない場合、障害があれば身体障害者手帳へスキップ
              target: '身体障害者手帳を持っていますか？',
              guard: ({ context }) => {
                const member = context.currentMember;
                return (
                  !context['病気やけが、障害はありますか？'][
                    member.relationship
                  ][member.index].selection.includes('病気がある') &&
                  hasDisability({ context })
                );
              },
            },
            {
              // 在宅療養中でなく病気も障害もない場合、介護施設へスキップ
              target: '介護施設に入所していますか？',
              guard: ({ context }) => {
                const member = context.currentMember;
                return (
                  !context['病気やけが、障害はありますか？'][
                    member.relationship
                  ][member.index].selection.includes('病気がある') &&
                  !hasDisability({ context })
                );
              },
            },
          ],
          hasBack: true,
        }
      ),
    },
    '感染症にかかっていますか？': {
      on: actionObj<'感染症にかかっていますか？'>({
        questionKey: '感染症にかかっていますか？',
        nextQuestionKey: 'HIVに感染していますか？',
        nextConditions: [
          {
            target: '腎不全ですか？',
            guard: ({ context }) => {
              const member = context.currentMember;
              return (
                context['感染症にかかっていますか？'][member.relationship][
                  member.index
                ].selection === false
              );
            },
          },
        ],
        hasBack: true,
      }),
    },
    'HIVに感染していますか？': {
      on: actionObj<'HIVに感染していますか？'>({
        questionKey: 'HIVに感染していますか？',
        nextQuestionKey: 'エイズを発症していますか？',
        nextConditions: [
          {
            target: 'C型肝炎に感染していますか？',
            guard: ({ context }) => {
              const member = context.currentMember;
              return (
                context['HIVに感染していますか？'][member.relationship][
                  member.index
                ].selection === false
              );
            },
          },
        ],
        hasBack: true,
      }),
    },
    'エイズを発症していますか？': {
      on: actionObj<'エイズを発症していますか？'>({
        questionKey: 'エイズを発症していますか？',
        nextQuestionKey: '家族に血液製剤によってHIVに感染した方はいますか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '家族に血液製剤によってHIVに感染した方はいますか？': {
      on: actionObj<'家族に血液製剤によってHIVに感染した方はいますか？'>({
        questionKey: '家族に血液製剤によってHIVに感染した方はいますか？',
        nextQuestionKey: '血液製剤の投与によってHIVに感染しましたか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '血液製剤の投与によってHIVに感染しましたか？': {
      on: actionObj<'血液製剤の投与によってHIVに感染しましたか？'>({
        questionKey: '血液製剤の投与によってHIVに感染しましたか？',
        nextQuestionKey: 'C型肝炎に感染していますか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    'C型肝炎に感染していますか？': {
      on: actionObj<'C型肝炎に感染していますか？'>({
        questionKey: 'C型肝炎に感染していますか？',
        nextQuestionKey:
          '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
        nextConditions: [
          {
            target: '腎不全ですか？',
            guard: ({ context }) => {
              const member = context.currentMember;
              return (
                context['C型肝炎に感染していますか？'][member.relationship][
                  member.index
                ].selection === false
              );
            },
          },
        ],
        hasBack: true,
      }),
    },
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？': {
      on: actionObj<'血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'>({
        questionKey: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
        nextQuestionKey:
          '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？': {
      on: actionObj<'肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'>(
        {
          questionKey:
            '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
          nextQuestionKey: '腎不全ですか？',
          nextConditions: [],
          hasBack: true,
        }
      ),
    },
    '腎不全ですか？': {
      on: actionObj<'腎不全ですか？'>({
        questionKey: '腎不全ですか？',
        nextQuestionKey: '慢性腎不全ですか？',
        nextConditions: [
          {
            target: '先天性の血液凝固因子異常症（血友病等）ですか？',
            guard: ({ context }) => {
              const member = context.currentMember;
              return (
                context['腎不全ですか？'][member.relationship][member.index]
                  .selection === false
              );
            },
          },
        ],
        hasBack: true,
      }),
    },
    '慢性腎不全ですか？': {
      on: actionObj<'慢性腎不全ですか？'>({
        questionKey: '慢性腎不全ですか？',
        nextQuestionKey: '人工透析を行っていますか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '人工透析を行っていますか？': {
      on: actionObj<'人工透析を行っていますか？'>({
        questionKey: '人工透析を行っていますか？',
        nextQuestionKey: '先天性の血液凝固因子異常症（血友病等）ですか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '先天性の血液凝固因子異常症（血友病等）ですか？': {
      on: actionObj<'先天性の血液凝固因子異常症（血友病等）ですか？'>({
        questionKey: '先天性の血液凝固因子異常症（血友病等）ですか？',
        nextQuestionKey:
          '血液凝固因子異常症のうち、当てはまるものはどれですか？',
        nextConditions: [
          {
            target: '身体障害者手帳を持っていますか？',
            guard: ({ context }) => {
              const member = context.currentMember;
              return (
                context['先天性の血液凝固因子異常症（血友病等）ですか？'][
                  member.relationship
                ][member.index].selection === false &&
                hasDisability({ context })
              );
            },
          },
          {
            target: '介護施設に入所していますか？',
            guard: ({ context }) => {
              const member = context.currentMember;
              return (
                context['先天性の血液凝固因子異常症（血友病等）ですか？'][
                  member.relationship
                ][member.index].selection === false &&
                !hasDisability({ context })
              );
            },
          },
        ],
        hasBack: true,
      }),
    },
    '血液凝固因子異常症のうち、当てはまるものはどれですか？': {
      on: actionObj<'血液凝固因子異常症のうち、当てはまるものはどれですか？'>({
        questionKey: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
        nextQuestionKey: '身体障害者手帳を持っていますか？',
        nextConditions: [
          {
            target: '介護施設に入所していますか？',
            guard: ({ context }) => !hasDisability({ context }),
          },
        ],
        hasBack: true,
      }),
    },
    '身体障害者手帳を持っていますか？': {
      on: actionObj<'身体障害者手帳を持っていますか？'>({
        questionKey: '身体障害者手帳を持っていますか？',
        nextQuestionKey: '精神障害者保健福祉手帳を持っていますか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '精神障害者保健福祉手帳を持っていますか？': {
      on: actionObj<'精神障害者保健福祉手帳を持っていますか？'>({
        questionKey: '精神障害者保健福祉手帳を持っていますか？',
        nextQuestionKey: '療育手帳、または愛の手帳を持っていますか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '療育手帳、または愛の手帳を持っていますか？': {
      on: actionObj<'療育手帳、または愛の手帳を持っていますか？'>({
        questionKey: '療育手帳、または愛の手帳を持っていますか？',
        nextQuestionKey: '放射線障害がありますか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '放射線障害がありますか？': {
      on: actionObj<'放射線障害がありますか？'>({
        questionKey: '放射線障害がありますか？',
        nextQuestionKey:
          '内部障害（内臓などのからだの内部の障害）がありますか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '内部障害（内臓などのからだの内部の障害）がありますか？': {
      on: actionObj<'内部障害（内臓などのからだの内部の障害）がありますか？'>({
        questionKey: '内部障害（内臓などのからだの内部の障害）がありますか？',
        nextQuestionKey: '脳性まひ、または進行性筋萎縮症ですか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '脳性まひ、または進行性筋萎縮症ですか？': {
      on: actionObj<'脳性まひ、または進行性筋萎縮症ですか？'>({
        questionKey: '脳性まひ、または進行性筋萎縮症ですか？',
        nextQuestionKey: '介護施設に入所していますか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '介護施設に入所していますか？': {
      on: actionObj<'介護施設に入所していますか？'>({
        questionKey: '介護施設に入所していますか？',
        nextQuestionKey: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
        nextConditions: [
          // 子どもは「高校、大学...学生ですか？」以降の質問をスキップ
          {
            // 次の子どもへ
            target: 'changeToNextChild',
            guard: ({ context }) => {
              const childrenNum = context.子どもの人数.あなた[0]?.selection;
              if (childrenNum == null) {
                return false;
              }
              return (
                context.currentMember.relationship === '子ども' &&
                context.currentMember.index + 1 < childrenNum
              );
            },
          },
          {
            // 他に子どもがいなければ親の人数へ
            target: 'changeToSelfParentNum',
            guard: ({ context }) =>
              context.currentMember.relationship === '子ども',
          },
        ],
        hasBack: true,
      }),
    },
    '高校、大学、専門学校、職業訓練学校等の学生ですか？': {
      on: actionObj<'高校、大学、専門学校、職業訓練学校等の学生ですか？'>({
        questionKey: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
        nextQuestionKey: '家を借りたいですか？',
        nextConditions: [
          {
            target: '妊娠中、または産後6ヵ月以内ですか？',
            guard: ({ context }) => {
              return context.currentMember.relationship === '配偶者';
            },
          },
          // 親の質問はここで終了
          {
            // 次の親へ
            target: 'changeToNextParent',
            guard: ({ context }) => {
              const parentNum = context.親の人数.あなた[0]?.selection;
              if (parentNum == null) {
                return false;
              }
              return (
                context.currentMember.relationship === '親' &&
                context.currentMember.index + 1 < parentNum
              );
            },
          },
          {
            // 他に親がいなければ終了
            target: 'result',
            guard: ({ context }) => context.currentMember.relationship === '親',
          },
        ],
        hasBack: true,
      }),
    },
    '家を借りたいですか？': {
      on: actionObj<'家を借りたいですか？'>({
        questionKey: '家を借りたいですか？',
        nextQuestionKey: '妊娠中、または産後6ヵ月以内ですか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '妊娠中、または産後6ヵ月以内ですか？': {
      on: actionObj<'妊娠中、または産後6ヵ月以内ですか？'>({
        questionKey: '妊娠中、または産後6ヵ月以内ですか？',
        nextQuestionKey: '困りごとはありますか？',
        nextConditions: [
          {
            target: '以下のいずれかに当てはまりますか？',
            guard: ({ context }) => {
              return context.currentMember.relationship === '配偶者';
            },
          },
        ],
        hasBack: true,
      }),
    },
    '困りごとはありますか？': {
      on: actionObj<'困りごとはありますか？'>({
        questionKey: '困りごとはありますか？',
        nextQuestionKey: '配偶者はいますか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '配偶者はいますか？': {
      on: actionObj<'配偶者はいますか？'>({
        questionKey: '配偶者はいますか？',
        nextQuestionKey: '子どもの人数',
        nextConditions: [
          {
            // 配偶者がいる場合、配偶者の質問へ
            target: 'changeToSpouse',
            guard: ({ context }) => {
              return context['配偶者はいますか？'].あなた[0].selection === true;
            },
          },
        ],
        hasBack: true,
      }),
    },
    子どもの人数: {
      on: actionObj<'子どもの人数'>({
        questionKey: '子どもの人数',
        nextQuestionKey: '親の人数',
        nextConditions: [
          {
            // 子どもがいる場合、子どもの質問へ
            target: 'changeToChild',
            guard: ({ context }) => {
              return context['子どもの人数'].あなた[0].selection
                ? context['子どもの人数'].あなた[0].selection > 0
                : false;
            },
          },
        ],
        hasBack: true,
      }),
    },
    親の人数: {
      on: actionObj<'親の人数'>({
        questionKey: '親の人数',
        nextQuestionKey: 'result',
        nextConditions: [
          {
            // 親がいる場合、親の質問へ
            target: 'changeToParent',
            guard: ({ context }) => {
              return context['親の人数'].あなた[0].selection
                ? context['親の人数'].あなた[0].selection > 0
                : false;
            },
          },
        ],
        hasBack: true,
      }),
    },
    '以下のいずれかに当てはまりますか？': {
      on: actionObj<'以下のいずれかに当てはまりますか？'>({
        questionKey: '以下のいずれかに当てはまりますか？',
        nextQuestionKey: 'changeToSelfChildrenNum',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '高校に通っていますか？': {
      on: actionObj<'高校に通っていますか？'>({
        questionKey: '高校に通っていますか？',
        nextQuestionKey: '現在仕事をしていますか？',
        nextConditions: [
          {
            // 高校に通っている場合は履修種別の質問へ
            target: '通っている高校の種類を選んでください（1）',
            guard: ({ context }) => {
              const member = context.currentMember;
              return (
                context['高校に通っていますか？'][member.relationship][
                  member.index
                ]?.selection === true
              );
            },
          },
        ],
        hasBack: true,
      }),
    },
    '通っている高校の種類を選んでください（1）': {
      on: actionObj<'通っている高校の種類を選んでください（1）'>({
        questionKey: '通っている高校の種類を選んでください（1）',
        nextQuestionKey: '通っている高校の種類を選んでください（2）',
        nextConditions: [],
        hasBack: true,
      }),
    },
    '通っている高校の種類を選んでください（2）': {
      on: actionObj<'通っている高校の種類を選んでください（2）'>({
        questionKey: '通っている高校の種類を選んでください（2）',
        nextQuestionKey: '現在仕事をしていますか？',
        nextConditions: [],
        hasBack: true,
      }),
    },
    // 最後の状態（結果表示）
    // NOTE: type "final" は使わない（状態遷移が完了しbackで戻れなくなるため）
    result: {
      on: {
        back: {
          target: 'history',
        },
      },
    },
    // 質問対象の世帯員を切り替えるためのダミーの状態
    // NOTE: 世帯員切り替え処理を通常の質問と分離するため、こちらのダミー状態を経由している
    changeToSpouse: {
      // alwaysを使用しそのまま次の状態へ遷移
      always: {
        target: '年齢',
      },
      // 状態を抜ける際に必ず実行
      exit: assign({
        currentMember: () => {
          return {
            relationship: '配偶者',
            index: 0,
          };
        },
      }),
    },
    changeToChild: {
      // alwaysを使用しそのまま次の状態へ遷移
      always: {
        target: '年齢',
      },
      // 状態を抜ける際に必ず実行
      exit: assign({
        currentMember: () => {
          return {
            relationship: '子ども',
            index: 0,
          };
        },
      }),
    },
    changeToNextChild: {
      always: {
        target: '年齢',
      },
      // 状態を抜ける際に必ず実行
      exit: assign({
        currentMember: ({ context }: { context: QuestionStateContext }) => {
          return {
            relationship: '子ども',
            index: context.currentMember.index + 1,
          };
        },
      }),
    },
    changeToParent: {
      // alwaysを使用しそのまま次の状態へ遷移
      always: {
        target: '年齢',
      },
      // 状態を抜ける際に必ず実行
      exit: assign({
        currentMember: () => {
          return {
            relationship: '親',
            index: 0,
          };
        },
      }),
    },
    changeToNextParent: {
      always: {
        target: '年齢',
      },
      // 状態を抜ける際に必ず実行
      exit: assign({
        currentMember: ({ context }: { context: QuestionStateContext }) => {
          return {
            relationship: '親',
            index: context.currentMember.index + 1,
          };
        },
      }),
    },
    changeToSelfChildrenNum: {
      // alwaysを使用しそのまま次の状態へ遷移
      always: {
        target: '子どもの人数',
      },
      // 状態を抜ける際に必ず実行
      exit: assign({
        currentMember: () => {
          return {
            relationship: 'あなた',
            index: 0,
          };
        },
      }),
    },
    changeToSelfParentNum: {
      // alwaysを使用しそのまま次の状態へ遷移
      always: {
        target: '親の人数',
      },
      // 状態を抜ける際に必ず実行
      exit: assign({
        currentMember: () => {
          return {
            relationship: 'あなた',
            index: 0,
          };
        },
      }),
    },
    // 履歴を使って前の状態に戻るためのダミーの状態
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
