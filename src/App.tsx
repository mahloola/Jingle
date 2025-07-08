import 'bootstrap/dist/css/bootstrap.min.css';
import './style/leaflet.css';
import './App.css';
import './style/audio.css';
import './style/uiBox.css';
import './style/osrs-ui.css';
import useSWR from 'swr';
import { match } from 'ts-pattern';
import DailyJingle from './components/DailyJingle';
import MainMenu from './components/MainMenu';
import Practice from './components/Practice';
import { getDailyChallenge } from './data/jingle-api';
import { Page } from './types/jingle';
import { getCurrentDateInBritain } from './utils/date-utils';
import { Route, Routes } from 'react-router-dom';

function App() {
  const { data: dailyChallenge } = useSWR(
    `/api/daily-challenges/${getCurrentDateInBritain()}`,
    () => getDailyChallenge(getCurrentDateInBritain()),
  );

  return (
    <div
      className='App'
      style={{
        backgroundImage: `url(/assets/background.jpg)`,
        backgroundSize: 'cover',
      }}
    >
      <Routes>
        <Route
          path='/'
          element={<MainMenu dailyChallenge={dailyChallenge} />}
        />
        <Route
          path='/daily'
          element={dailyChallenge && <DailyJingle dailyChallenge={dailyChallenge} />}
        />
        <Route
          path='/practice'
          element={<Practice />}
        />
      </Routes>
    </div>
  );
}

export default App;
