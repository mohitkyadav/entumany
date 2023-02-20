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

serviceWorkerRegistration.register();
reportWebVitals();
