import { getReferralAreaConfig } from './config';
import type {
  ConcernCandidate,
  ConcernSelection,
  ConcernUrgency,
  ReferralAnswerOption,
  ReferralAnswers,
  ReferralAreaId,
  ReferralDocument,
  ReferralDocumentConcern,
  ReferralQuestion,
  ReferralState,
  Urgency,
  UrgencyLabel,
} from './types';

export const DEFAULT_REFERRAL_DESTINATION = 'お住まいの市町村の相談窓口';

export const MAX_OTHER_CONCERNS = 3;

export const URGENCY_LABELS: Readonly<
  Record<Urgency, UrgencyLabel | '問題なし'>
> = {
  none: '問題なし',
  low: '低',
  medium: '中',
  high: '高',
};

const CONCERN_URGENCY_LABELS: Readonly<Record<ConcernUrgency, UrgencyLabel>> = {
  low: '低',
  medium: '中',
  high: '高',
};

const URGENCY_RECOMMENDATIONS: Readonly<Record<ConcernUrgency, string>> = {
  high: 'ぜひ窓口に相談することを薦めます。',
  medium: '窓口に相談してみてはどうですか',
  low: '自分の身を守るため知ってください',
};

export const urgencyToLabel = (urgency: Urgency): UrgencyLabel | '問題なし' =>
  URGENCY_LABELS[urgency];

export const getSelectedAnswer = (
  question: ReferralQuestion,
  answers: ReferralAnswers
): ReferralAnswerOption | undefined => {
  const selectedAnswerId = answers[question.id];
  return question.answers.find((answer) => answer.id === selectedAnswerId);
};

export const areAllQuestionsAnswered = (
  areaId: ReferralAreaId,
  answers: ReferralAnswers
): boolean =>
  getReferralAreaConfig(areaId).questions.every(
    (question) => getSelectedAnswer(question, answers) !== undefined
  );

export const resolveReferralDestination = (
  answer: ReferralAnswerOption
): string => answer.destination?.trim() || DEFAULT_REFERRAL_DESTINATION;

export const deriveConcernCandidates = (
  areaId: ReferralAreaId | null,
  answers: ReferralAnswers
): ConcernCandidate[] => {
  if (areaId === null) {
    return [];
  }

  return getReferralAreaConfig(areaId).questions.flatMap((question, order) => {
    const answer = getSelectedAnswer(question, answers);
    if (answer === undefined || answer.urgency === 'none') {
      return [];
    }

    return [
      {
        id: question.id,
        questionId: question.id,
        questionLabel: question.label,
        answerId: answer.id,
        answerLabel: answer.label,
        score: answer.score,
        urgency: answer.urgency,
        destination: resolveReferralDestination(answer),
        sourceDestination: answer.destination,
        order,
      },
    ];
  });
};

export const reconcileConcernSelection = (
  candidates: readonly ConcernCandidate[],
  mainConcernId: string | null,
  otherConcernIds: readonly string[]
): ConcernSelection => {
  const candidateIds = new Set(candidates.map((candidate) => candidate.id));
  const nextMainConcernId =
    mainConcernId !== null && candidateIds.has(mainConcernId)
      ? mainConcernId
      : null;
  const selectedOtherIds = new Set(
    otherConcernIds.filter(
      (id) => id !== nextMainConcernId && candidateIds.has(id)
    )
  );
  const nextOtherConcernIds = candidates
    .filter((candidate) => selectedOtherIds.has(candidate.id))
    .slice(0, MAX_OTHER_CONCERNS)
    .map((candidate) => candidate.id);

  return {
    mainConcernId: nextMainConcernId,
    otherConcernIds: nextOtherConcernIds,
  };
};

export const isValidReferralEmail = (value: string): boolean => {
  const email = value.trim();
  if (email.length === 0) {
    return true;
  }

  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const toDocumentConcern = (
  candidate: ConcernCandidate
): ReferralDocumentConcern => ({
  id: candidate.id,
  label: candidate.questionLabel,
  urgency: candidate.urgency,
  urgencyLabel: CONCERN_URGENCY_LABELS[candidate.urgency],
  answer: candidate.answerLabel,
  destination: candidate.destination,
});

export const createReferralDocument = (
  state: ReferralState
): ReferralDocument | null => {
  if (
    state.areaId === null ||
    !areAllQuestionsAnswered(state.areaId, state.answers) ||
    !isValidReferralEmail(state.inputs.email)
  ) {
    return null;
  }

  const candidates = deriveConcernCandidates(state.areaId, state.answers);
  const selection = reconcileConcernSelection(
    candidates,
    state.mainConcernId,
    state.otherConcernIds
  );
  if (selection.mainConcernId === null) {
    return null;
  }

  const mainCandidate = candidates.find(
    (candidate) => candidate.id === selection.mainConcernId
  );
  if (mainCandidate === undefined) {
    return null;
  }

  const otherCandidates = candidates.filter((candidate) =>
    selection.otherConcernIds.includes(candidate.id)
  );
  const name = state.inputs.name.trim();
  const email = state.inputs.email.trim();
  const message = state.inputs.message.trim();

  return {
    guide: {
      introduction:
        '回答いただいた内容に基づいて紹介状を作成しました。説明書の内容をよく確認の上、窓口へ相談に行ってみましょう。',
      concernLabel: mainCandidate.questionLabel,
      urgency: mainCandidate.urgency,
      urgencyLabel: CONCERN_URGENCY_LABELS[mainCandidate.urgency],
      recommendation: URGENCY_RECOMMENDATIONS[mainCandidate.urgency],
      destination: mainCandidate.destination,
      searchMethods: [
        `市町村の代表番号に電話し「${mainCandidate.questionLabel}ので相談窓口を知りたい」と伝える`,
        `ネットで「${mainCandidate.destination} お住まいの市町村名 電話番号」で検索し連絡する`,
      ],
      contactInstruction: `窓口に連絡し「${mainCandidate.questionLabel}ので相談に乗ってほしい」と伝える`,
      letterInstruction:
        'そのときに、画面に表示された「紹介状」もご利用ください',
    },
    letter: {
      introduction:
        '※この紹介状は、アプリ「支援みつもりヤドカリくん」を使用し、\nユーザーの方が支援につながりやすいように作られました。',
      ...(name.length > 0 ? { name } : {}),
      ...(email.length > 0 ? { email } : {}),
      mainConcern: toDocumentConcern(mainCandidate),
      otherConcerns: otherCandidates.map(toDocumentConcern),
      ...(message.length > 0 ? { message } : {}),
      creator: '防窮研究会',
    },
  };
};
