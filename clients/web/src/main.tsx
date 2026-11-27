import { logHandledException } from './data/sessionLog';
import './observability';
import { reactErrorHandler } from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const sentryReactError = reactErrorHandler();
const reportReactError = (error: unknown, info: { componentStack?: string | null }) => {
  logHandledException('react.root', error);
  sentryReactError(error, info);
};
createRoot(document.getElementById('root')!, {
  onUncaughtError: reportReactError,
  onCaughtError: reportReactError,
  onRecoverableError: reportReactError,
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

