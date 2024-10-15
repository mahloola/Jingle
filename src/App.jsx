import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useRef, useState } from 'react';
import './App.css';
import RunescapeMap from './RunescapeMap';
import Footer from './components/Footer';
import HomeButton from './components/HomeButton';
import MainMenu from './components/MainMenu';
import ResultMessage from './components/ResultMessage';
import ResultScreen from './components/ResultScreen';
import UiBox from './components/UiBox';
import { songHostUrl } from './data/hostUrl';
import './style/leaflet.css';
import { calculateTimeDifference } from './utils/calculateTimeDifference';
import getJingleNumber from './utils/getJingleNumber';
import { getRandomSong } from './utils/getSong';

const initialSong = getRandomSong();

function App({ dailyChallenge }) {
  const audioRef = useRef(null);
  const sourceRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(initialSong);
  const [currentSongUi, setCurrentSongUi] = useState(initialSong);
  const [guessResult, setGuessResult] = useState(-1);
  const [startedGame, setStartedGame] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [resultsArray, setResultsArray] = useState([]);
  const [dailyChallengeIndex, setDailyChallengeIndex] = useState(0);
  const [dailyComplete, setDailyComplete] = useState(false);
  const [dailyMode, setDailyMode] = useState(false);
  const [practiceRoundsMode, setPracticeRoundsMode] = useState(false);
  const [percentile, setPercentile] = useState(0);
  const [correctPolygon, setCorrectPolygon] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const playSong = (songName) => {
    const src = `${songHostUrl}/${songName.trim().replaceAll(' ', '_')}.mp3`;
    sourceRef.current.src = src;
    audioRef.current.load();
    audioRef.current.play();
  };
  return (
    <div className='App'>
      <div>
        <div className='App-inner'>
          <div
            className='ui-box'
            style={{ display: startedGame ? 'block' : 'none' }}
          >
            <HomeButton />
            <UiBox
              dailyMode={dailyMode}
              practiceRoundsMode={practiceRoundsMode}
              resultsArray={resultsArray}
              dailyComplete={dailyComplete}
              dailyChallenge={dailyChallenge}
              setCurrentSong={setCurrentSong}
              guessResult={guessResult}
              setResultVisible={setResultVisible}
              setCorrectPolygon={setCorrectPolygon}
              dailyChallengeIndex={dailyChallengeIndex}
              playSong={playSong}
              audioRef={audioRef}
              sourceRef={sourceRef}
              setDailyChallengeIndex={setDailyChallengeIndex}
            ></UiBox>
            <Footer />
          </div>
        </div>
        <div className={`${!startedGame ? 'blur' : ''}`}>
          <RunescapeMap
            setCorrectPolygon={setCorrectPolygon}
            correctPolygon={correctPolygon}
            currentSong={currentSong}
            setGuessResult={setGuessResult}
            setResultVisible={setResultVisible}
            resultVisible={resultVisible}
            resultsArray={resultsArray}
            setResultsArray={setResultsArray}
            dailyChallengeIndex={dailyChallengeIndex}
            setDailyComplete={setDailyComplete}
            startedGame={startedGame}
            currentSongUi={currentSongUi}
            setCurrentSongUi={setCurrentSongUi}
            setPercentile={setPercentile}
            startTime={startTime}
            setTimeTaken={setTimeTaken}
            totalDailyResults={dailyChallenge?.results}
          />
        </div>

        {!startedGame && (
          <MainMenu
            setDailyComplete={setDailyComplete}
            setResultsArray={setResultsArray}
            setTimeTaken={setTimeTaken}
            setStartedGame={setStartedGame}
            setStartTime={setStartTime}
            setCurrentSong={setCurrentSong}
            currentSong={currentSong}
            playSong={playSong}
            dailyChallenge={dailyChallenge}
            dailyMode={dailyMode}
            setDailyMode={setDailyMode}
            dailyComplete={dailyComplete}
            setPracticeRoundsMode={setPracticeRoundsMode}
          ></MainMenu>
        )}
        {dailyComplete && (
          <ResultScreen
            resultsArray={resultsArray}
            percentile={percentile}
            time={
              timeTaken
                ? timeTaken
                : calculateTimeDifference(startTime, new Date())
            }
            jingleNumber={getJingleNumber(dailyChallenge)}
          />
        )}
        {!dailyComplete && (
          <ResultMessage
            resultVisible={resultVisible}
            guessResult={guessResult}
            currentSongUi={currentSongUi}
          ></ResultMessage>
        )}
      </div>
    </div>
  );
}

export default App;
