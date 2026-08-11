export type ReferralAreaId = 'elderly' | 'childcare' | 'young-adult';

export type Urgency = 'none' | 'low' | 'medium' | 'high';

export type ConcernUrgency = Exclude<Urgency, 'none'>;

export type UrgencyLabel = '低' | '中' | '高';

export interface ReferralAnswerOption {
  readonly id: string;
  readonly label: string;
  readonly score: number | null;
  readonly urgency: Urgency;
  /** The answer-specific destination exactly as recorded in the source Sheet. */
  readonly destination: string | null;
}

export interface ReferralQuestion {
  readonly id: string;
  readonly label: string;
  readonly answers: readonly ReferralAnswerOption[];
}

export interface ReferralAreaConfig {
  readonly id: ReferralAreaId;
  readonly label: string;
  readonly sourceTab: string;
  readonly questions: readonly ReferralQuestion[];
}

export type ReferralAnswers = Record<string, string>;

export interface ConcernCandidate {
  /** Candidate identity. A question can contribute at most one candidate. */
  readonly id: string;
  readonly questionId: string;
  readonly questionLabel: string;
  readonly answerId: string;
  readonly answerLabel: string;
  readonly score: number | null;
  readonly urgency: ConcernUrgency;
  /** A non-empty destination, with the documented fallback applied. */
  readonly destination: string;
  /** The unmodified answer-specific destination from the source Sheet. */
  readonly sourceDestination: string | null;
  readonly order: number;
}

export interface ConcernSelection {
  readonly mainConcernId: string | null;
  readonly otherConcernIds: string[];
}

export interface ReferralInputs {
  name: string;
  email: string;
  message: string;
}

export type ReferralStep =
  | { kind: 'description' }
  | { kind: 'notice' }
  | { kind: 'area' }
  | { kind: 'questions'; questionIndex: number }
  | { kind: 'no-concerns' }
  | { kind: 'concerns' }
  | { kind: 'details' }
  | { kind: 'result' };

export interface ReferralState {
  readonly version: 1;
  step: ReferralStep;
  noticeAccepted: boolean;
  areaId: ReferralAreaId | null;
  answers: ReferralAnswers;
  mainConcernId: string | null;
  otherConcernIds: string[];
  inputs: ReferralInputs;
}

export type ReferralAction =
  | { type: 'SET_STEP'; step: ReferralStep }
  | { type: 'SET_NOTICE_ACCEPTED'; accepted: boolean }
  | { type: 'SELECT_AREA'; areaId: ReferralAreaId }
  | {
      type: 'ANSWER_QUESTION';
      questionId: string;
      answerId: string;
    }
  | { type: 'SELECT_MAIN_CONCERN'; concernId: string | null }
  | { type: 'TOGGLE_OTHER_CONCERN'; concernId: string }
  | {
      type: 'SET_INPUT';
      field: keyof ReferralInputs;
      value: string;
    }
  | { type: 'SET_INPUTS'; inputs: ReferralInputs }
  | { type: 'RESTORE'; state: ReferralState }
  | { type: 'RESET' };

export interface ReferralDocumentConcern {
  readonly id: string;
  readonly label: string;
  readonly urgency: ConcernUrgency;
  readonly urgencyLabel: UrgencyLabel;
  readonly answer: string;
  readonly destination: string;
}

export interface ReferralGuide {
  readonly introduction: string;
  readonly concernLabel: string;
  readonly urgency: ConcernUrgency;
  readonly urgencyLabel: UrgencyLabel;
  readonly recommendation: string;
  readonly destination: string;
  readonly searchMethods: readonly [string, string];
  readonly contactInstruction: string;
  readonly letterInstruction: string;
}

export interface ReferralLetter {
  readonly introduction: string;
  readonly name?: string;
  readonly email?: string;
  readonly mainConcern: ReferralDocumentConcern;
  readonly otherConcerns: readonly ReferralDocumentConcern[];
  readonly message?: string;
  readonly creator: '防窮研究会';
}

export interface ReferralDocument {
  readonly guide: ReferralGuide;
  readonly letter: ReferralLetter;
}
