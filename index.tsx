import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    originalError(...args);

    const first = args[0];
    if (
      typeof first === 'string' &&
      first.includes(
        'The final argument passed to useEffect changed size between renders',
      )
    ) {
      originalError(
        '[autopost.ai] Captured stack for useEffect deps warning:\n',
        new Error().stack,
      );
    }
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);