import type { Preview } from '@storybook/react-vite';
import { setupWorker } from 'msw/browser';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { handlers } from '../src/mocks/handlers';

const preview: Preview = {
  loaders: [
    mswLoader(async () => {
      const worker = setupWorker();
      await worker.start({
        serviceWorker: { url: '/mockServiceWorker.js' },
        onUnhandledRequest(request, print) {
          // Static assets and development modules are not API requests.
          if (new URL(request.url).pathname.endsWith('/calculate'))
            print.error();
        },
      });
      return worker;
    }),
  ],
  parameters: {
    msw: { handlers },
    // Audit every story, report findings, and track remediation separately.
    a11y: { test: 'todo' },
  },
};

export default preview;
