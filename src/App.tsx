import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router-dom';
import Snowfall from 'react-snowfall';
import useSWR from 'swr';
import './App.css';
import { AuthProvider } from './AuthContext';
import DailyJingle from './components/DailyJingle';
import Login from './components/Login/Login';
import MainMenu from './components/MainMenu';
import MultiplayerLobby from './components/MultiLobby/MultiLobby';
import Multiplayer from './components/Multiplayer/Multiplayer/Multiplayer';
import Practice from './components/Practice';
import Profile from './components/Profile/Profile';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Register from './components/Register/Register';
import { getDailyChallenge, getLobbies } from './data/jingle-api';
import './style/audio.css';
import './style/leaflet.css';
import './style/osrs-ui.css';
import './style/uiBox.css';
import { getCurrentDateInBritain } from './utils/date-utils';
import Support from './components/Support/Support';
function App() {
  const { data: dailyChallenge } = useSWR(
    `/api/daily-challenges/${getCurrentDateInBritain()}`,
    () => getDailyChallenge(getCurrentDateInBritain()),
  );
  const { data: lobbies } = useSWR('/api/lobbies', getLobbies, {
    refreshInterval: 1000, // Poll every 1 second
    revalidateOnFocus: false, // Optional: don't refetch on window focus
    dedupingInterval: 500, // Optional: prevent duplicate requests
  });

  return (
    <AuthProvider>
      <div
        className='App'
        style={{
          backgroundImage: `url(/assets/background.jpg)`,
          backgroundSize: 'cover',
        }}
      >
        <Snowfall />
        <Routes>
          <Route
            path='/'
            element={
              <MainMenu
                dailyChallenge={dailyChallenge}
                multiLobbies={lobbies}
              />
            }
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
            path='/support'
            element={
              <Support />
            }
          />

          <Route
            path='/multiplayer/:lobbyId'
            element={
              <ProtectedRoute>
                <MultiplayerLobby />
              </ProtectedRoute>
            }
          />

          <Route
            path='/profile'
            element={
              <ProtectedRoute>
                <Profile />
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
