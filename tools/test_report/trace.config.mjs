// Optional instrumented unit run: no changes to application tests or production config.
import base from '../../dashboard/vite.config.mts';
import { fileURLToPath } from 'node:url';
export default async () => {
  const config = await base();
  config.test.projects[0].test.setupFiles.push(
    fileURLToPath(
      new URL('../../dashboard/testReportTrace.mjs', import.meta.url)
    )
  );
  return config;
};
