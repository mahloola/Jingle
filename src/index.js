import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { getDailyChallenge } from './db/db';
import './index.css';
import getCurrentDateInBritain from './utils/getCurrentDateinBritain';

async function renderApp() {
  const today = getCurrentDateInBritain();
  const dailyChallenge = await getDailyChallenge(today);

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App dailyChallenge={dailyChallenge} />
    </React.StrictMode>,
  );
}

renderApp();
