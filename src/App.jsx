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

// TODO:
// previous, show answer, guess, skip, next buttons laid out horizontally with rs-style buttons + simple icons
// rs-stylize the volume control and the start button. overlay volume control on top left of map vertically
// overlay all the buttons on top of the map
// omit dungeon data by geojson data coordinate filtering, also omit instances by checking if there is a geojson data coordinate for it
// regenerate tile data for bigger zoom levels (maybe up to 7-8, and remove 0-1)
// fix map bounds
// difficulty settings

const isFeatureVisibleOnMap = (feature) =>
  feature.geometry.coordinates.some((polygon) =>
    polygon.every((point) => {
      const [x, y] = toOurPixelCoordinates(point);
      return y > 0;
    })
  );
const getRandomSong = () => {
  const visibleFeatures = geojsondata.features.filter(isFeatureVisibleOnMap);
  const randomFeature = visibleFeatures.sort(
    () => Math.random() - Math.random()
  )[0];
  const randomSongName = decodeHTML(
    randomFeature.properties.title.match(/>(.*?)</)[1]
  );
  console.log("Current song: ", randomSongName);
  return randomSongName;
};

const initialSong = getRandomSong();

function App() {
  const audioRef = useRef(null);
  const sourceRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(initialSong);

  const [guessResult, setGuessResult] = useState(0);
  const [startedGame, setStartedGame] = useState(false);
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
    // setTimeout(() => {
    //   audioRef.current.pause();
    // }, 2000);
  };

  return (
    <div className="App">
      <div className="content">
        <div className={`content ${!startedGame ? "blur" : ""}`}>
          <RunescapeMap
            currentSong={currentSong}
            setGuessResult={setGuessResult}
            setResultVisible={setResultVisible}
          />
        </div>
        <br />
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
          className="ui-box"
          style={{ display: startedGame ? "block" : "none" }}
        >
          <div
            className="alert alert-success result-message"
            role="alert"
            id="successMessage"
            style={{
              opacity: successVisible ? 1 : 0,
              transition: "opacity 0.3s",
              position: "absolute",
              top: "50%",
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
              top: "50%",
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
          <div className="below-map">
            <audio controls id="audio" ref={audioRef}>
              <source id="source" ref={sourceRef} type="audio/ogg"></source>
            </audio>
            <br />
            <div className="buttons">
              {/* guess button */}
              <Button variant="primary" onClick={function () {}}>
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
            {/* <div
              className="grey-text"
              style={{
                color: "dimgray",
              }}
            >
              Drop a pin where the music plays, then press the guess button.
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
