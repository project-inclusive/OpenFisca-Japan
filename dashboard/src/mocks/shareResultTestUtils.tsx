import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { currentDateAtom } from '../state';
import { TestProviders } from '../components/questions/template/questionTemplateTestUtils';
import { Result } from '../components/result/result';
import { FormResponseError } from '../components/errors/FormResponseError';
import { calculationDate } from './calculateFixtures';

// Fixed synthetic links, created with the compact-array and legacy deflate
// formats. Do not encode them at test time: these exercise opening saved URLs.
export const savedShareKeys = {
  compact:
    'NYpBCoAwDAT_succkqBC8pWSg9aLKD7Akr_bCp6GYabowiIziZJRwwpv2Ha4mDHhuCuck1DlD8o6Zfa1XvAyQgw7u3AQno8ZLw',
  legacy:
    'lZLPS8JgGMf/l/dcsEkF7u6hS4fwEhFdspMYiJ5k4LsSf9IUZxFOJNqmaaKW6JpKf8y799128l9o75YopkTwXp7n+3l+vylg6g9Y7+PqM+BSAEEBwQ6CTWrYnZolNfHniMg58qhSVygcOj05Dp8BDrDBILPPsO4D/B7A4j3OeEiACRxRP3sIOIanUq+M4CsSBPbvpG7wwTIpjfWbM/W0rbUo6tt+Iq2z9J+v9X3hFVwpa9WpNMyYc9G5nTuwig3ZkkubLQPSGJrGm4t4Y3k81gVcMizJII3Kb14v2oOJq3t8pmx1VZIv4nl1k4wlo9E1ZOwoBR+8JHIaD8T/8UprB+9ul4ymROoTcWS/T3dRkwJJq25VLL7YH1knW9kK0htcx29iiUjsarX/LZ9ldSxquF3XB0goICgh2PYCpzXTKCLYRVBB8A5BDXCJeDJC0dwYGxqFnHrWktrmV8N5MhazHFaGRO35My9m+Z8Anv8G',
  legacyWithoutFrontend:
    'q1Z6smPa0x3rn05eqGRVrfS4selx46rHjfNBnBerpj6fMv/pzi3P5nQ8m74UJOQa4hrk5xkSqWSlZGhpaaBrYAhESrU6Sk/7+562gpUYGRiZgcQNTZWsDGpBUmsnPG5c+bipyZCwoUDNJjBDQXohjnuyo+HFsuUgpRA+xKBlq2Di0UjujgVbiJBBsh0ktbH1yd7+l817XzZOfrprzvM5PehOVno2d+OTXWuASsDeAqt/uqPpac+u51N2PZs7EVP9ju4XG7YD5cHqWyc8X730WWf3072T0VXmlebkICnZ9nJJF0Rh/LM5DU839JOmfslyHOqBoftsy+5nU9Y/69/yYtNuXKq2dz1rWAq09Wn/4heb21+2T8SqEAgA',
};

export const shareModes = [
  {
    name: 'simple',
    label: 'かんたん見積もり',
    flags: '1=1&2=0',
    back: '/calculate-simple',
  },
  { name: 'detailed', label: 'くわしく見積もり', flags: '1=0&2=0', back: '/' },
  {
    name: 'disaster',
    label: '地震被災者支援見積もり',
    flags: '1=0&2=1',
    back: '/calculate-disaster',
  },
] as const;

export const shareQuery = (
  key: string,
  flags = shareModes[1].flags as string
) =>
  // Keep legacy '+' characters unescaped, as in previously distributed links.
  `?share=${key}&${flags}`;

export const replaceShareLocation = (query: string) => {
  const originalUrl = window.location.href;
  const originalState: unknown = window.history.state;
  window.history.replaceState(null, '', `/result${query}`);
  return () => window.history.replaceState(originalState, '', originalUrl);
};

const Destination = () => {
  const location = useLocation();
  return <output aria-label="移動先">{location.pathname}</output>;
};

export const SharedResultTestPage = ({ query }: { query: string }) => (
  <TestProviders
    initializeState={({ set }) => set(currentDateAtom, calculationDate)}
  >
    {/* A fresh Recoil root and absent navigation state model opening a link. */}
    <MemoryRouter initialEntries={[{ pathname: '/result', search: query }]}>
      <Routes>
        <Route path="/result" element={<Result />} />
        <Route path="/response-error" element={<FormResponseError />} />
        <Route path="*" element={<Destination />} />
      </Routes>
    </MemoryRouter>
  </TestProviders>
);
