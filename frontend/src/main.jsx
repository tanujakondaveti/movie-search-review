import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import './index.css';

import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/ErrorFallback';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <App />
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
);
