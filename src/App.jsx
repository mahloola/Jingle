import React, { useRef } from "react";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Button from "react-bootstrap/Button";
import RunescapeMap from "./RunescapeMap";
import { FaDiscord, FaGithub, FaDonate } from "react-icons/fa";
import { getRandomSong } from "./utils/getSong";
import GuessCountComponent from "./components/guessCount";

// TODO:
// rs-stylize the volume control and the start button. overlay volume control on top left of map vertically
// regenerate tile data for bigger zoom levels (maybe up to 7-8, and remove 0-1)
// difficulty settings

const initialSong = getRandomSong();

function App() {
  const audioRef = useRef(null);
  const sourceRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(initialSong);
  const [guessResult, setGuessResult] = useState(0);
  const [startedGame, setStartedGame] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  let next = false;
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
        <div
          style={{
            width: "100vw",
            height: "100dvh",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            position: "absolute",
            paddingBottom: "5vh",
          }}
        >
          <div
            className="statistics"
            style={{ display: startedGame ? "block" : "none" }}
          >
            <table>
              <tr>
                <td>Guesses</td>
                <td style={{ textAlign: "right" }}>
                  <GuessCountComponent />
                </td>
              </tr>
              <tr>
                <td>Users</td>
                <td style={{ textAlign: "right" }}>4</td>
              </tr>
            </table>
          </div>
          <div
            className="ui-box"
            style={{ display: startedGame ? "block" : "none" }}
          >
            <div className="below-map">
              {/* guess button */}
              <Button
                className="button"
                variant={guessResult == 0 ? "info" : "secondary"}
                disabled={guessResult == 0 ? true : false}
                onClick={() => {
                  const newSongName = getRandomSong();
                  setCurrentSong(newSongName);
                  playSong(newSongName);
                  setResultVisible(true);
                }}
              >
                {guessResult == 0 ? "Place your pin on the map" : "Skip"}
              </Button>
              <audio controls id="audio" ref={audioRef}>
                <source id="source" ref={sourceRef} type="audio/ogg"></source>
              </audio>
            </div>
            <div className="credits">
              <span>
                <a
                  className="icon"
                  href="https://github.com/mahloola/osrs-music"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub />
                </a>
                <a className="icon" href="https://discord.gg/7sB8fyUS9W">
                  <FaDiscord />
                </a>
                <a className="icon" href="https://ko-fi.com/mahloola">
                  <FaDonate />
                </a>
              </span>
              <div>
                developed by{" "}
                <a href="https://twitter.com/mahloola" className="link">
                  mahloola
                </a>{" "}
                and{" "}
                <a href="https://twitter.com/FunOrange42" className="link">
                  FunOrange
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className={`${!startedGame ? "blur" : ""}`}>
          <RunescapeMap
            currentSong={currentSong}
            setGuessResult={setGuessResult}
            setResultVisible={setResultVisible}
            resultVisible={resultVisible}
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
            {/* <h1 className="main-menu-description">"It's like GeoGuessr, but for OSRS Music"</h1> */}
            <h1 className="main-menu-option" style={{ left: "30%" }}>
              Daily
              <br />
              Challenge
            </h1>
            <h1
              className="main-menu-option"
              style={{ left: "70%" }}
              onClick={() => {
                setStartedGame(true);
                playSong(currentSong);
              }}
            >
              Practice Mode
            </h1>
          </div>
        )}

        <div
          className="alert result-message result-card"
          role="alert"
          style={{
            opacity: resultVisible ? 1 : 0,
          }}
        >
          Score
          <br />
          {guessResult}
        </div>
      </div>
    </div>
  );
}

export default App;
