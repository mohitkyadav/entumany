import React from 'react';
import {createRoot} from 'react-dom/client';

import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Styles
import 'normalize.css';
import 'react-tooltip/dist/react-tooltip.css';
import 'styles/main.scss';

import App from 'containers/App';

import AppProvider from 'contexts/App.context';
import {EntumanyDB} from 'services/db.service';

const container = document.querySelector('#root');
if (!container) {
  throw new Error('render: Root element not found');
}

const root = createRoot(container);

new EntumanyDB();

root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
);

// Auto-update the PWA: when a new version is deployed, activate the waiting
// service worker right away and reload once it takes over, so users stop seeing
// the previously cached build.
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    const newWorker = registration.waiting ?? registration.installing;
    if (!newWorker) {
      window.location.reload();
      return;
    }
    newWorker.postMessage({type: 'SKIP_WAITING'});
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'activated') {
        window.location.reload();
      }
    });
  },
});
reportWebVitals();
