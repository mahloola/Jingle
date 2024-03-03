import React, { useRef } from "react";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import * as songs from "./songs.json";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import RunescapeMap from "./RunescapeMap";
import geojsondata from "./data/GeoJSON";
import { toOurPixelCoordinates } from "./utils/coordinate-utils";
import { decodeHTML } from "./utils/string-utils";
import { FaDiscord, FaGithub } from "react-icons/fa";

// TODO:
// previous, show answer, guess, skip, next buttons laid out horizontally with rs-style buttons + simple icons
// rs-stylize the volume control and the start button. overlay volume control on top left of map vertically
// omit dungeon data by geojson data coordinate filtering, also omit instances by checking if there is a geojson data coordinate for it
// regenerate tile data for bigger zoom levels (maybe up to 7-8, and remove 0-1)
// fix map bounds
// difficulty settings

const playedSongs = new Set();
const playedSongsOrder = [];

const isFeatureVisibleOnMap = (feature) =>
  feature.geometry.coordinates.some((polygon) =>
    polygon.every((point) => {
      const [x, y] = toOurPixelCoordinates(point);
      return y > 0;
    })
  );
const getRandomSong = () => {
  let randomSongName = '';
  const visibleFeatures = geojsondata.features.filter(isFeatureVisibleOnMap);
  do {
    const randomFeature = visibleFeatures.sort(
      () => Math.random() - Math.random()
    )[0];
    randomSongName = decodeHTML(
      randomFeature.properties.title.match(/>(.*?)</)[1]
    );
    console.log("ROLLED: ", randomSongName);
  } while (playedSongs.has(randomSongName));
  updatePlayedSongs(randomSongName);
  console.log(playedSongs);
  console.log("Current song: ", randomSongName);
  return randomSongName;
};

const updatePlayedSongs = (newSongName) => {
  console.log("updated!")
  playedSongsOrder.push(newSongName);

  // If limit is reached, remove the oldest song
  if (playedSongsOrder.length > 100) { //change val based on how many songs should be shown without dupes
    const oldestSong = playedSongsOrder.shift();
    playedSongs.delete(oldestSong);
  }

  playedSongs.add(newSongName);
};

const initialSong = getRandomSong();

function App() {
  const audioRef = useRef(null);
  const sourceRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(initialSong);

  const [guessResult, setGuessResult] = useState(0);
  const [startedGame, setStartedGame] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const exactMatch = guessResult === 1000;
  const [resultVisible, setResultVisible] = useState(false);
  const successVisible = exactMatch && resultVisible;
  const failureVisible = !exactMatch && resultVisible;

  const playSong = (songName) => {
    const src = `https://oldschool.runescape.wiki/images/${songName
      .trim()
      .replaceAll(" ", "_")}.ogg`;
    sourceRef.current.src = src;
    audioRef.current.load();
    audioRef.current.play();
    if (hardMode) {
      setTimeout(() => {
        audioRef.current.pause();
      }, 3000);
    }
  };

  const handleHardModeChange = (e) => {
    setHardMode(e.target.checked);
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
            className="ui-box"
            style={{ display: startedGame ? "block" : "none" }}
          >
            <div className="below-map">
              <audio controls id="audio" ref={audioRef}>
                <source id="source" ref={sourceRef} type="audio/ogg"></source>
              </audio>
              <div className="buttons">
                {/* hard mode button */}
                {/* <input
                  type="checkbox"
                  id="hardModeCheckbox"
                  checked={hardMode}
                  onChange={handleHardModeChange}
                />
                <label htmlFor="hardModeCheckbox">3 Second Mode</label> */}
                {/* guess button */}
                <Button variant="primary" onClick={() => {}}>
                  Guess
                </Button>
                {/* song button */}
                <Button
                variant="secondary"
                className="songButton"
                onClick={() => {
                  const newSongName = getRandomSong();
                  setCurrentSong(newSongName);
                  playSong(newSongName);
                }}
              >
                Skip
              </Button>
              </div>
            </div>
            <div className="credits">
              <span >
                <a className="icon"
                  href="https://github.com/mahloola/osrs-music"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub />
                </a>
                <a className="icon" href="https://discord.gg/7sB8fyUS9W">
                  <FaDiscord />
                </a>
              </span>
              <div>
                developed by{" "}
                <a href="https://twitter.com/mahloola" className="link">
                  mahloola
                </a>{" "}
                &amp;{" "}
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
          />
        </div>
        {!startedGame && (
          <Button
            variant="success"
            className="start-button"
            onClick={() => {
              setStartedGame(true);
              playSong(currentSong);
            }}
          >
            Start Game
          </Button>
        )}
        <div
          className="alert alert-success result-message"
          role="alert"
          id="successMessage"
          style={{
            opacity: successVisible ? 1 : 0,
            transition: "opacity 0.3s",
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "3rem",
            fontWeight: "bold",
            textAlign: "center",
            zIndex: 9999,

            // glass
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(5px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",

            color: "rgb(19, 211, 64)",
            textShadow: "1px 1px 13px rgba(0, 0, 0, 0.8)",
            padding: "1rem 2rem",
          }}
        >
          Good job!
        </div>

        <div
          className="alert result-message"
          role="alert"
          id="failMessage"
          style={{
            transition: "opacity 0.3s",
            opacity: failureVisible ? 1 : 0,
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "3rem",
            fontWeight: "bold",
            textAlign: "center",
            zIndex: 9999,

            // glass
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(5px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",

            color: "#03030c",
            textShadow: "1px 1px 13px rgba(0, 13, 254, 0.8)",
            padding: "1rem 2rem",
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
