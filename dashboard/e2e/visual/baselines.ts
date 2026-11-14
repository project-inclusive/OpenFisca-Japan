import { existsSync } from 'node:fs';

// Kept independent of browser fixtures so missing-oracle behavior is testable offline.
export function requireBaselines(paths: string[], capture: boolean) {
  if (capture) return;
  const missing = paths.filter((path) => !existsSync(path));
  if (missing.length) {
    throw new Error(
      `Visual baselines are missing:\n${missing.join('\n')}\n` +
        'Capture the pre-upgrade develop build in Docker with ' +
        '`bash e2e/visual/docker.sh capture`, review and commit the PNG and ARIA files. ' +
        'Comparison never creates baselines.'
    );
  }
}
