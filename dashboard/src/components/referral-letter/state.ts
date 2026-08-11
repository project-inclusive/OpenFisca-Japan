import { getReferralAreaConfig, REFERRAL_AREA_IDS } from './config';
import {
  areAllQuestionsAnswered,
  deriveConcernCandidates,
  isValidReferralEmail,
  MAX_OTHER_CONCERNS,
  reconcileConcernSelection,
} from './logic';
import type {
  ReferralAction,
  ReferralAreaId,
  ReferralInputs,
  ReferralState,
  ReferralStep,
} from './types';

export const REFERRAL_STATE_VERSION = 1 as const;

export const REFERRAL_STORAGE_KEY = 'yadokari.referral-letter.v1';

export const REFERRAL_INPUT_LIMITS: Readonly<
  Record<keyof ReferralInputs, number>
> = {
  name: 100,
  email: 254,
  message: 100,
};

export const createInitialReferralState = (): ReferralState => ({
  version: REFERRAL_STATE_VERSION,
  step: { kind: 'description' },
  noticeAccepted: false,
  areaId: null,
  answers: {},
  mainConcernId: null,
  otherConcernIds: [],
  inputs: {
    name: '',
    email: '',
    message: '',
  },
});

const limitInput = <Field extends keyof ReferralInputs>(
  field: Field,
  value: ReferralInputs[Field]
): ReferralInputs[Field] => value.slice(0, REFERRAL_INPUT_LIMITS[field]);

const limitInputs = (inputs: ReferralInputs): ReferralInputs => ({
  name: limitInput('name', inputs.name),
  email: limitInput('email', inputs.email),
  message: limitInput('message', inputs.message),
});

export const referralReducer = (
  state: ReferralState,
  action: ReferralAction
): ReferralState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };

    case 'SET_NOTICE_ACCEPTED':
      return { ...state, noticeAccepted: action.accepted };

    case 'SELECT_AREA':
      if (action.areaId === state.areaId) {
        return state;
      }

      return {
        ...state,
        areaId: action.areaId,
        answers: {},
        mainConcernId: null,
        otherConcernIds: [],
      };

    case 'ANSWER_QUESTION': {
      if (state.areaId === null) {
        return state;
      }

      const question = getReferralAreaConfig(state.areaId).questions.find(
        (item) => item.id === action.questionId
      );
      if (
        question === undefined ||
        !question.answers.some((answer) => answer.id === action.answerId)
      ) {
        return state;
      }

      const answers = {
        ...state.answers,
        [action.questionId]: action.answerId,
      };
      const selection = reconcileConcernSelection(
        deriveConcernCandidates(state.areaId, answers),
        state.mainConcernId,
        state.otherConcernIds
      );

      return {
        ...state,
        answers,
        ...selection,
      };
    }

    case 'SELECT_MAIN_CONCERN': {
      const candidates = deriveConcernCandidates(state.areaId, state.answers);
      const selection = reconcileConcernSelection(
        candidates,
        action.concernId,
        state.otherConcernIds
      );
      return { ...state, ...selection };
    }

    case 'TOGGLE_OTHER_CONCERN': {
      const candidates = deriveConcernCandidates(state.areaId, state.answers);
      const candidateExists = candidates.some(
        (candidate) => candidate.id === action.concernId
      );
      if (!candidateExists || action.concernId === state.mainConcernId) {
        return state;
      }

      const isSelected = state.otherConcernIds.includes(action.concernId);
      if (!isSelected && state.otherConcernIds.length >= MAX_OTHER_CONCERNS) {
        return state;
      }

      const otherConcernIds = isSelected
        ? state.otherConcernIds.filter((id) => id !== action.concernId)
        : [...state.otherConcernIds, action.concernId];
      const selection = reconcileConcernSelection(
        candidates,
        state.mainConcernId,
        otherConcernIds
      );
      return { ...state, ...selection };
    }

    case 'SET_INPUT':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [action.field]: limitInput(action.field, action.value),
        },
      };

    case 'SET_INPUTS':
      return { ...state, inputs: limitInputs(action.inputs) };

    case 'RESTORE':
      return (
        sanitizeReferralState(action.state) ?? createInitialReferralState()
      );

    case 'RESET':
      return createInitialReferralState();
  }
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isReferralAreaId = (value: unknown): value is ReferralAreaId =>
  typeof value === 'string' &&
  (REFERRAL_AREA_IDS as readonly string[]).includes(value);

const isReferralStep = (value: unknown): value is ReferralStep => {
  if (!isObject(value) || typeof value.kind !== 'string') {
    return false;
  }

  if (value.kind === 'questions') {
    return (
      typeof value.questionIndex === 'number' &&
      Number.isInteger(value.questionIndex) &&
      value.questionIndex >= 0 &&
      value.questionIndex < 7
    );
  }

  return [
    'description',
    'notice',
    'area',
    'no-concerns',
    'concerns',
    'details',
    'result',
  ].includes(value.kind);
};

const isStringRecord = (value: unknown): value is Record<string, string> =>
  isObject(value) &&
  Object.values(value).every((item) => typeof item === 'string');

const hasValidInputShape = (
  value: unknown
): value is Record<keyof ReferralInputs, string> =>
  isObject(value) &&
  typeof value.name === 'string' &&
  typeof value.email === 'string' &&
  typeof value.message === 'string';

/**
 * Validates untrusted sessionStorage data and returns a canonical state.
 * Unknown/stale answer IDs are dropped and dependent selections are reconciled.
 */
export const sanitizeReferralState = (value: unknown): ReferralState | null => {
  if (
    !isObject(value) ||
    value.version !== REFERRAL_STATE_VERSION ||
    !isReferralStep(value.step) ||
    typeof value.noticeAccepted !== 'boolean' ||
    !(value.areaId === null || isReferralAreaId(value.areaId)) ||
    !isStringRecord(value.answers) ||
    !(
      value.mainConcernId === null || typeof value.mainConcernId === 'string'
    ) ||
    !Array.isArray(value.otherConcernIds) ||
    !value.otherConcernIds.every((item) => typeof item === 'string') ||
    !hasValidInputShape(value.inputs)
  ) {
    return null;
  }

  if (
    value.areaId === null &&
    ['questions', 'no-concerns', 'concerns', 'details', 'result'].includes(
      value.step.kind
    )
  ) {
    return null;
  }

  if (
    !value.noticeAccepted &&
    [
      'area',
      'questions',
      'no-concerns',
      'concerns',
      'details',
      'result',
    ].includes(value.step.kind)
  ) {
    return null;
  }

  const answers: Record<string, string> = {};
  if (value.areaId !== null) {
    for (const question of getReferralAreaConfig(value.areaId).questions) {
      const answerId = value.answers[question.id];
      if (question.answers.some((answer) => answer.id === answerId)) {
        answers[question.id] = answerId;
      }
    }
  }

  const candidates = deriveConcernCandidates(value.areaId, answers);
  const selection = reconcileConcernSelection(
    candidates,
    value.mainConcernId,
    value.otherConcernIds
  );

  const allQuestionsAnswered =
    value.areaId !== null && areAllQuestionsAnswered(value.areaId, answers);

  switch (value.step.kind) {
    case 'questions': {
      if (value.areaId === null) {
        return null;
      }

      const precedingQuestions = getReferralAreaConfig(
        value.areaId
      ).questions.slice(0, value.step.questionIndex);
      if (
        precedingQuestions.some(
          (question) => answers[question.id] === undefined
        )
      ) {
        return null;
      }
      break;
    }

    case 'no-concerns':
      if (!allQuestionsAnswered || candidates.length !== 0) {
        return null;
      }
      break;

    case 'concerns':
      if (!allQuestionsAnswered || candidates.length === 0) {
        return null;
      }
      break;

    case 'details':
      if (
        !allQuestionsAnswered ||
        candidates.length === 0 ||
        selection.mainConcernId === null
      ) {
        return null;
      }
      break;

    case 'result':
      if (
        !allQuestionsAnswered ||
        candidates.length === 0 ||
        selection.mainConcernId === null ||
        !isValidReferralEmail(value.inputs.email)
      ) {
        return null;
      }
      break;
  }

  return {
    version: REFERRAL_STATE_VERSION,
    step: value.step,
    noticeAccepted: value.noticeAccepted,
    areaId: value.areaId,
    answers,
    ...selection,
    inputs: limitInputs(value.inputs),
  };
};

export const isReferralState = (value: unknown): value is ReferralState =>
  sanitizeReferralState(value) !== null;
