import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { getDailyChallenge } from './db/db';

async function renderApp() {
  const dailyChallenge = await getDailyChallenge();
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App dailyChallenge={dailyChallenge}/>
    </React.StrictMode>
  );
}

renderApp();