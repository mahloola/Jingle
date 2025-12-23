import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router-dom';
import useSWR from 'swr';
import './App.css';
import { AuthProvider } from './AuthContext';
import DailyJingle from './components/DailyJingle';
import Login from './components/Login/Login';
import MainMenu from './components/MainMenu';
import Multiplayer from './components/Multiplayer/Multiplayer/Multiplayer';
import Practice from './components/Practice';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Register from './components/Register/Register';
import { getDailyChallenge } from './data/jingle-api';
import './style/audio.css';
import './style/leaflet.css';
import './style/osrs-ui.css';
import './style/uiBox.css';
import { getCurrentDateInBritain } from './utils/date-utils';

function App() {
  const { data: dailyChallenge } = useSWR(
    `/api/daily-challenges/${getCurrentDateInBritain()}`,
    () => getDailyChallenge(getCurrentDateInBritain()),
  );

  return (
    <AuthProvider>
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

          <Route
            path='/multiplayer'
            element={
              <ProtectedRoute>
                <Multiplayer />
              </ProtectedRoute>
            }
          />

          <Route
            path='/login'
            element={<Login />}
          />
          <Route
            path='/register'
            element={<Register />}
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
