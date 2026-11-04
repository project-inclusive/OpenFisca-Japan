import { http, HttpResponse } from 'msw';
import {
  calculateErrorBody,
  calculateFixtures,
  CalculateScenario,
} from './calculateFixtures';

// Match local and deployed API origins; stories can select the same scenarios.
export const calculateEndpoint = '*/calculate';
export const calculateSuccessHandler = (scenario: CalculateScenario) =>
  http.post(calculateEndpoint, () =>
    HttpResponse.json(calculateFixtures[scenario].response)
  );

export const calculateFailureHandlers = {
  'HTTP 500': http.post(calculateEndpoint, () =>
    HttpResponse.text(calculateErrorBody, { status: 500 })
  ),
  'network error': http.post(calculateEndpoint, () => HttpResponse.error()),
};

export const handlers = [calculateSuccessHandler('both')];
