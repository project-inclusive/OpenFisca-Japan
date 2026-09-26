import { getReferralAreaConfig } from './config';
import type {
  ConcernCandidate,
  ConcernSelection,
  ReferralAnswerOption,
  ReferralAnswers,
  ReferralAreaId,
  ReferralDocument,
  ReferralDocumentConcern,
  ReferralDestination,
  ReferralQuestion,
  ReferralState,
  ReferralUrgencyLevel,
} from './types';

export const MAX_OTHER_CONCERNS = 3;

export const REFERRAL_URGENCY_LABELS: Readonly<
  Record<ReferralUrgencyLevel, '低' | '中' | '高'>
> = {
  low: '低',
  medium: '中',
  high: '高',
};

export const createDestinationInstruction = (
  destination: ReferralDestination
): string =>
  destination.url
    ? '案内ページを開き、お住まいの地域の連絡先や必要な情報を確認してください。'
    : `ネットで「${destination.name
        .replace(/役所HPから/g, '')
        .trim()} お住まいの市町村名 電話番号」で検索してください。`;

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

export const isReferralCandidateAnswer = (
  answer: ReferralAnswerOption
): boolean => answer.urgency !== 'none';

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
        urgency: answer.urgency,
        urgencyLevel: answer.urgency,
        destinations: answer.destinations,
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
  answer: candidate.answerLabel,
  destinations: candidate.destinations,
  urgencyLevel: candidate.urgencyLevel,
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
  const mainConcern = toDocumentConcern(mainCandidate);
  const otherConcerns = otherCandidates.map(toDocumentConcern);
  const name = state.inputs.name.trim();
  const email = state.inputs.email.trim();
  const message = state.inputs.message.trim();

  return {
    guide: {
      introduction:
        '回答いただいた内容に基づいて紹介状を作成しました。説明書の内容をよく確認の上、窓口へ相談に行ってみましょう。',
      concerns: [mainConcern, ...otherConcerns],
      searchMethods: mainCandidate.destinations.map((destination) => ({
        destination,
        instruction: createDestinationInstruction(destination),
      })),
      contactInstruction: `連絡先が見つかった場合は、窓口に電話し「${mainCandidate.questionLabel}について相談したい」と伝えてください。`,
      letterInstruction:
        '窓口に直接訪問した際に、画面に表示された「紹介状」もご利用ください。',
      disclaimer:
        '☆当説明書は相談を保証するものではありません。少しでも相談や支援につながれる可能性を高めるよう準備しました。',
    },
    letter: {
      introduction:
        '※この紹介状は、アプリ「支援みつもりヤドカリくん」を使用し、\nユーザーの方が支援につながりやすいように作られました。',
      ...(name.length > 0 ? { name } : {}),
      ...(email.length > 0 ? { email } : {}),
      mainConcern,
      otherConcerns,
      ...(message.length > 0 ? { message } : {}),
      creator: '防窮研究会',
      disclaimer:
        '☆当紹介状は相談・支援を強制するものではありません。お困りの方が、少しでも相談や支援につながれる可能性を高めるよう準備しました。',
    },
  };
};
