import { ReactElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { currentDateAtom, householdAtom } from '../state';
import { renderWithProviders } from '../components/questions/template/questionTemplateTestUtils';
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

export const renderErrorPage = (ui: ReactElement, state?: object) =>
  renderWithProviders(
    <MemoryRouter initialEntries={[{ pathname: '/error', state }]}>
      <Routes>
        <Route path="/error" element={ui} />
        <Route path="*" element={<Location />} />
      </Routes>
    </MemoryRouter>
  );

export const renderResult = (
  scenario: CalculateScenario,
  state = { isSimpleCalculation: false, isDisasterCalculation: false }
) =>
  renderWithProviders(
    <MemoryRouter initialEntries={[{ pathname: '/result', state }]}>
      <Location />
      <Routes>
        <Route path="/result" element={<Result />} />
        <Route path="/response-error" element={<FormResponseError />} />
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>,
    ({ set }) => {
      set(currentDateAtom, calculationDate);
      // Clone input fixtures so Recoil or a component cannot mutate later cases.
      set(householdAtom, structuredClone(calculateFixtures[scenario].request));
    }
  );
