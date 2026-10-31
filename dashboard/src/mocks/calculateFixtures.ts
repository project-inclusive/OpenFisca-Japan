import benefitRequest from './calculate/benefit-only.request.json';
import benefitResponse from './calculate/benefit-only.response.json';
import loanRequest from './calculate/loan-only.request.json';
import loanResponse from './calculate/loan-only.response.json';
import bothRequest from './calculate/both.request.json';
import bothResponse from './calculate/both.response.json';
import noneRequest from './calculate/none.request.json';
import noneResponse from './calculate/none.response.json';

// Synthetic display fixtures, not recordings or assertions about eligibility.
// Keep null output fields in requests so the API recalculates them on replay.
export const calculationDate = '2026-01-15';
export const calculateFixtures = {
  'benefit-only': { request: benefitRequest, response: benefitResponse },
  'loan-only': { request: loanRequest, response: loanResponse },
  both: { request: bothRequest, response: bothResponse },
  none: { request: noneRequest, response: noneResponse },
};
export type CalculateScenario = keyof typeof calculateFixtures;

export const resultCases = [
  { scenario: 'benefit-only', benefit: true, loan: false },
  { scenario: 'loan-only', benefit: false, loan: true },
  { scenario: 'both', benefit: true, loan: true },
  { scenario: 'none', benefit: false, loan: false },
] as const;

export const calculationModes = [
  {
    name: 'simple',
    state: { isSimpleCalculation: true, isDisasterCalculation: false },
    formPath: '/calculate-simple',
    resultErrorPath: '/calculate-simple',
  },
  {
    name: 'detailed',
    state: { isSimpleCalculation: false, isDisasterCalculation: false },
    formPath: '/calculate',
    // Result currently supplies redirect: '/' when its API call fails.
    resultErrorPath: '/',
  },
  {
    name: 'disaster',
    state: { isSimpleCalculation: false, isDisasterCalculation: true },
    formPath: '/calculate-disaster',
    resultErrorPath: '/calculate-disaster',
  },
] as const;

export const calculateErrorBody = 'Calculation failed';
