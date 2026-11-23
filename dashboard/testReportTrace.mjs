import { afterAll, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { transitionKey } from '../tools/test_report/transition_key.mjs';

const observations = new Map();
vi.mock('xstate', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    createActor(logic, options = {}) {
      return original.createActor(logic, {
        ...options,
        inspect(event) {
          options.inspect?.(event);
          if (event.type !== '@xstate.microstep') return;
          const name = expect.getState().currentTestName;
          for (const transition of event._transitions) {
            const key = transitionKey(transition);
            if (!observations.has(key)) observations.set(key, new Set());
            observations.get(key).add(name);
          }
        },
      });
    },
  };
});
afterAll(() => {
  const file = expect.getState().testPath;
  if (!file.endsWith('/state/questionState.test.ts')) return;
  const directory = path.resolve('../tmp/test-report');
  fs.mkdirSync(directory, { recursive: true });
  const fingerprint = crypto.createHash('sha256');
  for (const relative of [
    'src/state/questionState.ts',
    'src/state/questionDefinition.ts',
    'src/state/questionState.test.ts',
  ])
    fingerprint.update(fs.readFileSync(relative));
  fs.writeFileSync(
    path.join(directory, 'transitions.trace.json'),
    JSON.stringify(
      {
        fingerprint: fingerprint.digest('hex'),
        tests: Object.fromEntries(
          [...observations].map(([key, names]) => [key, [...names].sort()])
        ),
      },
      null,
      2
    ) + '\n'
  );
});
