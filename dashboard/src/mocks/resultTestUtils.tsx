import { ReactElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { currentDateAtom, householdAtom } from '../state';
import { TestProviders } from '../components/questions/template/questionTemplateTestUtils';
import { Result } from '../components/result/result';
import { FormResponseError } from '../components/errors/FormResponseError';
import {
  calculationDate,
  calculateFixtures,
  CalculateScenario,
} from './calculateFixtures';

const Location = () => {
  const location = useLocation();
  return <output data-testid="pathname">{location.pathname}</output>;
};

export const ErrorTestPage = ({
  ui,
  state,
}: {
  ui: ReactElement;
  state?: object;
}) => (
  <TestProviders>
    <MemoryRouter
      initialEntries={[{ pathname: '/error', state }]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/error" element={ui} />
        <Route path="*" element={<Location />} />
      </Routes>
    </MemoryRouter>
  </TestProviders>
);

export const ResultTestPage = ({
  scenario,
  state = { isSimpleCalculation: false, isDisasterCalculation: false },
}: {
  scenario: CalculateScenario;
  state?: { isSimpleCalculation: boolean; isDisasterCalculation: boolean };
}) => (
  <TestProviders
    initializeState={({ set }) => {
      set(currentDateAtom, calculationDate);
      // Clone input fixtures so Recoil or a component cannot mutate later cases.
      set(householdAtom, structuredClone(calculateFixtures[scenario].request));
    }}
  >
    <MemoryRouter
      initialEntries={[{ pathname: '/result', state }]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Location />
      <Routes>
        <Route path="/result" element={<Result />} />
        <Route path="/response-error" element={<FormResponseError />} />
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>
  </TestProviders>
);
