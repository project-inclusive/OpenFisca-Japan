import { useRecoilState } from 'recoil';
import { Question } from './templates/question';
import {
  defaultNextQuestionKeyAtom,
  householdAtom,
  householdHistoryAtom,
  nextQuestionKeyAtom,
  questionKeyAtom,
  questionKeyHistoryAtom,
  questionValidatedAtom,
  showsValidationErrorAtom,
} from '../../state';
import configData from '../../config/app_config.json';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionKey } from '../../question';

export type Question = {
  title: string;
  component: JSX.Element;
};

export type Questions = { [key in QuestionKey['person']]: Question[] };

const questionIndex = (questions: Questions, key: QuestionKey) => {
  return questions[key.person].findIndex((value) => value.title === key.title);
};

const defaultNextQuestionKeyOf = (
  questions: Questions,
  key: QuestionKey,
  household: any
): QuestionKey | null => {
  const index = questionIndex(questions, key);

  // その人に関する最後の質問でなければ同じ人の次の質問
  if (index < questions[key.person].length - 1) {
    return {
      person: key.person,
      personNum: key.personNum,
      title: questions[key.person][index + 1].title,
    };
  }

  // 次の人の最初の質問
  switch (key.person) {
    case 'あなた': {
      return {
        person: '配偶者',
        personNum: 0,
        title: questions['配偶者'][0].title,
      };
    }
    case '配偶者': {
      return {
        person: 'あなた',
        personNum: 0,
        title: '子どもの人数',
      };
    }
    case '子ども': {
      if (key.personNum < household.世帯一覧.世帯1.子一覧.length) {
        return {
          person: '子ども',
          personNum: key.personNum + 1,
          title: questions['子ども'][0].title,
        };
      }
      // 子どもの質問が完了

      // 親の質問が無ければ終了
      if (questions['親'].length === 0) {
        return null;
      }

      // 親の質問へ移る
      return {
        person: 'あなた',
        personNum: 0,
        title: '親の人数',
      };
    }
    case '親': {
      if (key.personNum < household.世帯一覧.世帯1.祖父母一覧.length) {
        return {
          person: '親',
          personNum: key.personNum + 1,
          title: questions['親'][0].title,
        };
      }

      // 終了
      return null;
    }
  }

  // switch文で網羅していることをチェック
  const exhaustivenessCheck: never = key.person;
};

const questionProgress = (questions: Questions, key: QuestionKey) => {
  const maxProgress =
    questions['あなた'].length +
    questions['配偶者'].length +
    questions['子ども'].length * configData.validation.household.maxChildren +
    questions['親'].length * configData.validation.household.maxParents;

  // HACK: 世帯員人数については、「あなた」の中に含まれるが聞くタイミングが異なるため専用の処理
  if (key.person === 'あなた' && key.title === '子どもの人数') {
    // 配偶者に関する設問まですべて完了した状態
    const progress = questions['あなた'].length + questions['配偶者'].length;
    return [progress, maxProgress];
  }
  if (key.person === 'あなた' && key.title === '親の人数') {
    // 子どもに関する設問まですべて完了した状態
    const progress =
      questions['あなた'].length +
      questions['配偶者'].length +
      questions['子ども'].length;
    return [progress, maxProgress];
  }

  const index = questionIndex(questions, key);
  switch (key.person) {
    case 'あなた': {
      const progress = index;
      return [progress, maxProgress];
    }
    case '配偶者': {
      const progress = questions['あなた'].length + index;
      return [progress, maxProgress];
    }
    case '子ども': {
      const progress =
        questions['あなた'].length +
        questions['配偶者'].length +
        questions['子ども'].length * (key.personNum - 1) +
        index;
      return [progress, maxProgress];
    }
    case '親': {
      const progress =
        questions['あなた'].length +
        questions['配偶者'].length +
        questions['子ども'].length *
          configData.validation.household.maxChildren +
        questions['親'].length * (key.personNum - 1) +
        index;
      return [progress, maxProgress];
    }
  }

  // switch文で網羅していることをチェック
  const exhaustivenessCheck: never = key.person;
};

export const QuestionList = ({
  questions,
  isSimpleCalculation,
  isDisasterCalculation,
}: {
  questions: Questions;
  isSimpleCalculation: boolean;
  isDisasterCalculation: boolean;
}) => {
  // 今表示している質問を管理
  const [questionKey, setQuestionKey] = useRecoilState(questionKeyAtom);
  // 次にどの質問に遷移すべきかを管理
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  // 次の質問のデフォルト値
  const [defaultNextQuestionKey, setDefaultNextQuestionKey] = useRecoilState(
    defaultNextQuestionKeyAtom
  );
  // これまでに答えた質問の履歴（戻るボタンで使用）
  const [keyHistory, setKeyHistory] = useRecoilState(questionKeyHistoryAtom);

  // バリデーションチェックの状態
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );
  const [showsValidationError, setShowsValidationError] = useRecoilState(
    showsValidationErrorAtom
  );

  // 世帯情報
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [householdHistory, setHouseholdHistory] =
    useRecoilState(householdHistoryAtom);

  useEffect(() => {
    // 2番目の質問を設定（初回のみ設定するためuseEffectの内部に記述）
    setDefaultNextQuestionKey({
      person: 'あなた',
      personNum: 0,
      title: questions['あなた'][1].title,
    });
  }, []);

  const navigate = useNavigate();

  const next = () => {
    if (!questionValidated) {
      // 入力不備のため次の質問には進まない
      setShowsValidationError(true);
      return;
    }
    setQuestionValidated(false);
    setShowsValidationError(false);
    // その後の操作が影響しないようディープコピー
    const copiedHousehold = JSON.parse(JSON.stringify(household));
    setHouseholdHistory([...householdHistory, copiedHousehold]);

    // nextQuestionKey が設定されていなければデフォルトの質問へ進む
    const mergedNextQuestionKey = nextQuestionKey ?? defaultNextQuestionKey;
    if (mergedNextQuestionKey == null) {
      // すべての質問に回答したので見積もり結果に飛ぶ
      navigate('/result', {
        state: {
          household: household,
          isSimpleCalculation: isSimpleCalculation,
          isDisasterCalculation: isDisasterCalculation,
        },
      });
      return;
    }

    setKeyHistory([...keyHistory, questionKey]);
    setQuestionKey(mergedNextQuestionKey);
    setNextQuestionKey(null);

    const newNextQuestionKey = defaultNextQuestionKeyOf(
      questions,
      mergedNextQuestionKey,
      household
    );
    setDefaultNextQuestionKey(newNextQuestionKey);
    // TODO: デバッグ用、UI移行が終わったら消す
    console.log(mergedNextQuestionKey);
  };

  const back = () => {
    if (keyHistory.length < 1) {
      // 初めての設問では何もしない
      return;
    }
    setQuestionValidated(true); // 過去の設問はすでにバリデーションチェックを満たしている
    setShowsValidationError(false); // バリデーションエラーはない

    const previousKey = keyHistory[keyHistory.length - 1];
    setKeyHistory(keyHistory.slice(0, keyHistory.length - 1));
    setQuestionKey(previousKey);

    // NOTE: 「前へ」で分岐のある質問に戻り別の選択肢を選んだ際本来選ばれないパラメータが指定されないよう、「前へ」を押すたびに更新前のhouseholdへ戻す
    // (将来的にメモリ使用量等のパフォーマンスが発生した場合は別の方法に修正)
    let previousHousehold = household;
    if (householdHistory.length > 0) {
      const previousHouseHoldHistory = [...householdHistory];
      previousHousehold = previousHouseHoldHistory.pop();
      setHousehold(previousHousehold);
      setHouseholdHistory(previousHouseHoldHistory);
    }

    setNextQuestionKey(null);
    const previousNextQuestionKey = defaultNextQuestionKeyOf(
      questions,
      previousKey,
      previousHousehold
    );
    setDefaultNextQuestionKey(previousNextQuestionKey);
  };

  const personStr = questionKey.personNum
    ? `${questionKey.person}（${questionKey.personNum}人目）`
    : questionKey.person;
  const [progress, maxProgress] = questionProgress(questions, questionKey);

  return (
    <Question
      title={`${personStr}について`}
      progress={progress}
      maxProgress={maxProgress}
      backOnClick={back}
      nextOnClick={next}
    >
      {
        questions[questionKey.person][questionIndex(questions, questionKey)]
          .component
      }
    </Question>
  );
};
