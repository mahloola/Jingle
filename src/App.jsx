import React, { useRef } from "react";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import RunescapeMap from "./RunescapeMap";
import { getRandomSong } from "./utils/getSong";
import DailyGuessLabel from "./components/dailyGuessLabel";
import Footer from "./components/footer";
import HomeButton from "./components/homeButton";
import { copyResultsToClipboard } from "./utils/copyResultsToClipboard";
import ResultScreen from "./components/resultScreen";

const initialSong = getRandomSong();
let dailyMode = false;

function App({ dailyChallenge }) {
  const audioRef = useRef(null);
  const sourceRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(initialSong);
  const [guessResult, setGuessResult] = useState(-1);
  const [startedGame, setStartedGame] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [dailyResults, setDailyResults] = useState([]);
  const [dailyChallengeIndex, setDailyChallengeIndex] = useState(0);
  const [dailyComplete, setDailyComplete] = useState(false);
  const [correctPolygon, setCorrectPolygon] = useState(null);

  const playSong = (songName) => {
    const src = `https://oldschool.runescape.wiki/images/${songName
      .trim()
      .replaceAll(" ", "_")}.ogg`;
    sourceRef.current.src = src;
    audioRef.current.load();
    audioRef.current.play();
  };
  return (
    <div className="App">
      <div>
        <div className="App-inner">
          <div className="ui-box" style={{ display: startedGame ? "block" : "none" }}>
            <HomeButton />
            <div className="below-map">
              {dailyMode && (
                <table
                  style={{
                    marginBottom: "10px",
                    width: "100%",
                    pointerEvents: "none",
                  }}>
                  <tbody>
                    <tr>
                      <td>
                        <DailyGuessLabel number={dailyResults[0] || "-"} />
                      </td>
                      <td>
                        <DailyGuessLabel number={dailyResults[1] || "-"} />
                      </td>
                      <td>
                        <DailyGuessLabel number={dailyResults[2] || "-"} />
                      </td>
                      <td>
                        <DailyGuessLabel number={dailyResults[3] || "-"} />
                      </td>
                      <td>
                        <DailyGuessLabel number={dailyResults[4] || "-"} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* guess button */}
              <div
                className="guess-btn-container"
                onClick={() => {
                  if (dailyMode) {
                    if (dailyComplete) {
                      copyResultsToClipboard(dailyResults);
                      return;
                    } else {
                      const newSongName = dailyChallenge.songs[dailyChallengeIndex + 1];
                      setCurrentSong(newSongName);
                      playSong(newSongName);
                      setDailyChallengeIndex(dailyChallengeIndex + 1);
                      setCorrectPolygon(null);
                      setResultVisible(false);
                    }
                  } else {
                    const newSongName = getRandomSong();
                    setCurrentSong(newSongName);
                    playSong(newSongName);
                    setCorrectPolygon(null);
                    setResultVisible(false);
                  }
                }}>
                <img
                  src={process.env.PUBLIC_URL + "../assets/osrsButtonWide.png"}
                  alt="OSRS Button"
                />
                <div className="guess-btn">
                  {dailyComplete == true
                    ? "Copy Results to Clipboard"
                    : guessResult == -1
                    ? "Place your pin on the map"
                    : "Next Song"}
                </div>
              </div>
              <audio controls id="audio" ref={audioRef}>
                <source id="source" ref={sourceRef} type="audio/ogg"></source>
              </audio>
            </div>
            <Footer />
          </div>
        </div>
        <div className={`${!startedGame ? "blur" : ""}`}>
          <RunescapeMap
            setCorrectPolygon={setCorrectPolygon}
            correctPolygon={correctPolygon}
            currentSong={currentSong}
            setGuessResult={setGuessResult}
            setResultVisible={setResultVisible}
            resultVisible={resultVisible}
            dailyResults={dailyResults}
            setDailyResults={setDailyResults}
            dailyChallengeIndex={dailyChallengeIndex}
            setDailyComplete={setDailyComplete}
          />
        </div>
        {!startedGame && (
          <div className="main-menu-container">
            <img
              className="main-menu-image"
              src={process.env.PUBLIC_URL + "/assets/Jingle.png"}
              alt="Jingle"
            />
            <h1 className="main-menu-text">Jingle</h1>
            <h1
              className="main-menu-option"
              style={{ left: "30%" }}
              onClick={() => {
                setStartedGame(true);
                setCurrentSong(dailyChallenge.songs[0]);
                playSong(dailyChallenge.songs[0]);
                dailyMode = true;
              }}>
              Daily
              <br />
              Jingle
            </h1>
            <h1
              className="main-menu-option"
              style={{ left: "70%" }}
              onClick={() => {
                setStartedGame(true);
                playSong(currentSong);
              }}>
              Practice Mode
            </h1>
          </div>
        )}
        {dailyComplete && (
          <ResultScreen dailyResults={dailyResults}/>
        )}
        {!dailyComplete &&
          <div
          className="alert result-message"
          role="alert"
          style={{
            opacity: resultVisible ? 1 : 0,
            transition: "opacity 500ms, margin-top 500ms ease-in-out",
            marginTop: resultVisible ? "-60px" : "0px",
            color: guessResult === 1000 ? "#00FF00" : guessResult === 0 ? "#FF0000" : "#edfd07",
          }}>
          +{guessResult}
        </div>
        }
      </div>
    </div>
  );
}

export default App;