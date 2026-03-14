import { AddressQuestionTemplate } from './template/addressQuestionTemplate';
import { QuestionFrame } from './template/questionFrame';
import {
  QuestionEvent,
  QuestionStateContext,
  questionStateMachine,
} from '../../state/questionState';
import { StateFrom } from 'xstate';
import { HouseholdMember } from '../../state/household';
import {
  AddressQuestion,
  AgeQuestion,
  AmountOfMoneyQuestion,
  BooleanQuestion,
  isAddressQuestion,
  isAgeQuestion,
  isAmountOfMoneyQuestion,
  isBooleanQuestion,
  isSelectionQuestion,
  QuestionKey,
  SelectionQuestion,
  selectionQuestionDefinitions,
} from '../../state/questionDefinition';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentDateAtom,
  householdAtom,
  questionValidatedAtom,
  showsValidationErrorAtom,
} from '../../state';
import { SelectionQuestionTemplate } from './template/selectionQuestionTemplate';
import { YesNoQuestionTemplate } from './template/yesNoQuestionTemplate';
import { useNavigate } from 'react-router-dom';
import { toOpenFiscaHousehold } from '../../state/convert';
import { useEffect } from 'react';
import { AgeQuestionTemplate } from './template/ageQuestionTemplate';
import { AmountOfMoneyQuestionTemplate } from './template/amountOfMoneyQuestionTemplate';

const personStr = (member: HouseholdMember): string => {
  switch (member.relationship) {
    case 'あなた':
      return 'あなた';
    case '配偶者':
      return '配偶者';
    case '子ども':
      return `子ども（${member.index + 1}人目）`;
    case '親':
      return `親（${member.index + 1}人目）`;
    default:
      const _: never = member.relationship; // 型の網羅性チェック
      throw new Error(
        `memberに想定外の形式が指定されています: ${JSON.stringify(member)}`
      );
  }
};

const QuestionContent = ({
  questionKey,
  context,
  send,
}: {
  questionKey: QuestionKey;
  context: QuestionStateContext;
  send: (e: QuestionEvent) => void;
}) => {
  if (isAddressQuestion(questionKey)) {
    const assignFunc = (question: AddressQuestion) => {
      send({
        type: questionKey,
        value: question,
      });
    };
    // NOTE: 関数化すると型推論が効かないので直接代入
    const initialValue =
      context[questionKey][context.currentMember.relationship][
        context.currentMember.index
      ];

    return (
      <AddressQuestionTemplate
        // 質問を切り替えるたびにフォーム表示をリセットするため、stateごとに一意なkeyを設定
        key={`${questionKey}-${context.currentMember.relationship}-${context.currentMember.index}`}
        assignFunc={assignFunc}
        initialValue={initialValue}
      />
    );
  }

  if (isAgeQuestion(questionKey)) {
    const assignFunc = (question: AgeQuestion) => {
      send({
        type: questionKey,
        value: question,
      });
    };
    // NOTE: 関数化すると型推論が効かないので直接代入
    const initialValue =
      context[questionKey][context.currentMember.relationship][
        context.currentMember.index
      ];

    return (
      <AgeQuestionTemplate
        // 質問を切り替えるたびにフォーム表示をリセットするため、stateごとに一意なkeyを設定
        key={`${questionKey}-${context.currentMember.relationship}-${context.currentMember.index}`}
        assignFunc={assignFunc}
        initialValue={initialValue}
      />
    );
  }

  if (isSelectionQuestion(questionKey)) {
    const assignFunc = (question: SelectionQuestion<typeof questionKey>) => {
      send({
        type: questionKey,
        value: question,
      });
    };
    // NOTE: 関数化すると型推論が効かないので直接代入
    const initialValue =
      context[questionKey][context.currentMember.relationship][
        context.currentMember.index
      ];

    return (
      <SelectionQuestionTemplate
        // 質問を切り替えるたびにフォーム表示をリセットするため、stateごとに一意なkeyを設定
        key={`${questionKey}-${context.currentMember.relationship}-${context.currentMember.index}`}
        title={questionKey}
        selections={selectionQuestionDefinitions[questionKey].selections}
        initialValue={initialValue}
        assignFunc={assignFunc}
      />
    );
  }

  if (isBooleanQuestion(questionKey)) {
    const assignFunc = (question: BooleanQuestion) => {
      send({
        type: questionKey,
        value: question,
      });
    };
    // NOTE: 関数化すると型推論が効かないので直接代入
    const initialValue =
      context[questionKey][context.currentMember.relationship][
        context.currentMember.index
      ];

    return (
      <YesNoQuestionTemplate
        // 質問を切り替えるたびにフォーム表示をリセットするため、stateごとに一意なkeyを設定
        key={`${questionKey}-${context.currentMember.relationship}-${context.currentMember.index}`}
        title={questionKey}
        initialValue={initialValue}
        assignFunc={assignFunc}
      />
    );
  }

  if (isAmountOfMoneyQuestion(questionKey)) {
    const assignFunc = (question: AmountOfMoneyQuestion) => {
      send({
        type: questionKey,
        value: question,
      });
    };
    // NOTE: 関数化すると型推論が効かないので直接代入
    const initialValue =
      context[questionKey][context.currentMember.relationship][
        context.currentMember.index
      ];

    return (
      <AmountOfMoneyQuestionTemplate
        // 質問を切り替えるたびにフォーム表示をリセットするため、stateごとに一意なkeyを設定
        key={`${questionKey}-${context.currentMember.relationship}-${context.currentMember.index}`}
        title={questionKey}
        initialValue={initialValue}
        assignFunc={assignFunc}
      />
    );
  }

  const _: never = questionKey; // 型の網羅性チェック
  throw new Error(`keyが質問と一致しませんでした: ${questionKey as any}`);
};

export const Question = ({
  state,
  send,
}: {
  state: StateFrom<typeof questionStateMachine>;
  send: (e: QuestionEvent) => void;
}) => {
  const navigate = useNavigate();
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  // バリデーションチェックの状態
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );
  const [showsValidationError, setShowsValidationError] = useRecoilState(
    showsValidationErrorAtom
  );

  useEffect(() => {
    // 質問が切り替わるたびにバリデーションエラー表示をリセット
    setShowsValidationError(false);
  }, [state.value]);

  useEffect(() => {
    // すべての質問に回答し "result" に到達したら見積もり結果へ遷移
    // HACK: navigateを実行するためuseEffect内で非同期処理
    if (state.value === 'result') {
      // 回答結果からバックエンドへ送信するhousehold形式へ変換
      const updatedHousehold = toOpenFiscaHousehold({
        context: state.context,
        currentDate: currentDate,
      });
      setHousehold(updatedHousehold);

      // 見積もり結果へ遷移
      navigate('/result', {
        state: {
          household: updatedHousehold,
          isSimpleCalculation: location.pathname === '/calculate-simple',
          isDisasterCalculation: location.pathname === '/calculate-disaster',
        },
      });
    }
  }, [state.value]);

  // すべての質問に回答し "result" に到達
  if (state.value === 'result') {
    // 非同期処理するため同期処理では空コンポーネントの生成のみ実施
    return <></>;
  }

  // HACK: "history" はダミーの状態なので可能性から除外
  if (state.value === 'history') {
    throw new Error(
      `xstateが予期せぬ状態遷移をしています: state: ${state.value}`
    );
  }

  // TODO: デバッグ用。終わったら消す
  const f = () => {
    state.context.currentMember;
    console.log(state.context);
    console.log(state.value);
  };
  f();

  // 現在の状態とボタンの定義
  const displayProgress = 1;
  const maxProgress = 10;
  const back = () => {
    send({ type: 'back' });
  };
  const next = () => {
    // 入力不備がある場合次の質問には進まない
    if (!questionValidated) {
      setShowsValidationError(true);
      return;
    }

    send({ type: 'next' });
  };

  return (
    <QuestionFrame
      title={`${personStr(state.context.currentMember)}について`}
      progress={displayProgress}
      maxProgress={maxProgress}
      backOnClick={back}
      nextOnClick={next}
      hasHistory={state.context.histories.length > 0}
    >
      {
        <QuestionContent
          questionKey={state.value}
          context={state.context}
          send={send}
        />
      }
    </QuestionFrame>
  );
};
