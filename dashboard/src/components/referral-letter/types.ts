export type ReferralAreaId = 'elderly' | 'childcare' | 'young-adult';

export type Urgency = 'none' | 'low' | 'medium' | 'high';

export type ReferralUrgencyLevel = 'low' | 'medium' | 'high';

export interface ReferralDestination {
  readonly name: string;
  readonly url: string | null;
}

export interface ReferralAnswerOption {
  readonly id: string;
  readonly label: string;
  readonly urgency: Urgency;
  readonly destinations: readonly ReferralDestination[];
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
  readonly urgency: Urgency;
  readonly urgencyLevel: ReferralUrgencyLevel;
  readonly destinations: readonly ReferralDestination[];
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
  | { kind: 'other-concerns' }
  | { kind: 'details' }
  | { kind: 'result' };

export interface ReferralState {
  readonly version: 2;
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
  readonly answer: string;
  readonly destinations: readonly ReferralDestination[];
  readonly urgencyLevel: ReferralUrgencyLevel;
}

export interface ReferralGuide {
  readonly introduction: string;
  readonly concerns: readonly ReferralDocumentConcern[];
  readonly searchMethods: readonly {
    destination: ReferralDestination;
    instruction: string;
  }[];
  readonly contactInstruction: string;
  readonly letterInstruction: string;
  readonly disclaimer: string;
}

export interface ReferralLetter {
  readonly introduction: string;
  readonly name?: string;
  readonly email?: string;
  readonly mainConcern: ReferralDocumentConcern;
  readonly otherConcerns: readonly ReferralDocumentConcern[];
  readonly message?: string;
  readonly creator: '防窮研究会';
  readonly disclaimer: string;
}

export interface ReferralDocument {
  readonly guide: ReferralGuide;
  readonly letter: ReferralLetter;
}
