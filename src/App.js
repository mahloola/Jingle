import React, { useRef } from "react";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import * as songs from "./songs.json";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import RunescapeMap from "./RunescapeMap";
import geojsondata from "./data/GeoJSON";

// TODO:
// fix white space in song names
// previous, show answer, guess, skip, next buttons laid out horizontally with rs-style buttons + simple icons
// rs-stylize the volume control and the start button. overlay volume control on top left of map vertically
// overlay all the buttons on top of the map
// omit dungeon data by geojson data coordinate filtering, also omit instances by checking if there is a geojson data coordinate for it
// regenerate tile data for bigger zoom levels (maybe up to 7-8, and remove 0-1)
// fix map bounds
// difficulty settings

function App() {
  const maxSongs = 728;
  const audioRef = useRef(null);
  const sourceRef = useRef(null);
  const [random, setRandom] = useState(
    Math.floor((Math.random() * maxSongs) / 2) * 2
  );
  const keys = Object.keys(songs);
  let name = keys[random];
  const [guessResult, setGuessResult] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [startedGame, setStartedGame] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [failureVisible, setFailureVisible] = useState(false);
  const [song, setSong] = useState();
  // when the song changes, update the audio
  useEffect(() => {
    let audioHTML = audioRef.current;
    let sourceHTML = sourceRef.current;
    if (audioHTML === null || sourceHTML === null) return;
    sourceHTML.src = song;
    audioHTML.load();
    audioHTML.play();
    console.log(`Currently playing ${song}`);
  }, [song]);

  useEffect(() => {
    if (guessResult === 1000) {
      setTotalScore(totalScore + 1000);
      setSuccessVisible(true);
      console.log(`Score: ${totalScore}`);
    } else {
      setTotalScore(totalScore + guessResult);
      setFailureVisible(true);
      console.log(`Score: ${totalScore}`);
    }
  }, [guessResult]);
  return (
    <div className="App">
      <div className="content">
        <div className={`content ${!startedGame ? "blur" : ""}`}>
          <RunescapeMap
            currentSong={name}
            guessResult={guessResult}
            setGuessResult={setGuessResult}
          />
        </div>
        <br />
        {!startedGame && (
          <Button
            variant="success"
            className="start-button"
            onClick={() => setStartedGame(true)}
          >
            Start Game
          </Button>
        )}
        {startedGame && (
          <div className="below-map">
            <audio controls id="audio" ref={audioRef}>
              <source
                id="source"
                src={`https://oldschool.runescape.wiki/images/${name.replaceAll(
                  " ",
                  "_"
                )}.ogg`}
                ref={sourceRef}
                type="audio/ogg"
              ></source>
            </audio>
            <br />
            <div className="buttons">
              {/* guess button */}
              {/* disabled={input.length < 4}  */}
              <Button variant="primary" onClick={function () {}}>
                Guess
              </Button>

              {/* song button */}
              <Button
                variant="secondary"
                className="songButton"
                onClick={() => {
                  setRandom(() => {
                    let newRandom = 0;
                    let newName = "";

                    for (let i = 0; i < geojsondata.features.length; i++) {
                      newRandom = Math.floor(Math.random() * maxSongs) + 1; // random number from 1 to maxSongs
                      newName = keys[newRandom];
                      let foundMatch = false; // if a match is found, set to true
                      const songNameString =
                        geojsondata.features[i].properties.title;
                      const contentInsideTags = songNameString.match(/>(.*?)</);
                      const result = contentInsideTags
                        ? contentInsideTags[1]
                        : null;
                      console.log(`New result: ${result}, ${newName}`);

                      // Check if the result matches the new name
                      if (result === newName) {
                        foundMatch = true;
                        // Check if any y-coordinate is above 4077
                        let above4077 = false;
                        for (const coords of geojsondata.features[i].geometry
                          .coordinates[0]) {
                          // If any y-coordinate is above 4077, choose a new song and continue the loop
                          if (coords[1] > 4077) {
                            above4077 = true;
                          }
                        }
                        if (above4077) {
                          console.log(
                            `Area for ${result} has coordinates above 4077, choosing a new song..`
                          );
                          continue;
                        } else {
                          // If no y-coordinate is above 4077, set the song and exit the loop
                          setSong(
                            `https://oldschool.runescape.wiki/images/${newName.replaceAll(
                              " ",
                              "_"
                            )}.ogg`
                          );
                          break;
                        }
                      }
                    }
                    return newRandom;
                  });
                }}
              >
                Skip
              </Button>
            </div>
            <div
              className="grey-text"
              style={{
                color: "dimgray",
              }}
            >
              Drop a pin where the music plays, then press the guess button.
            </div>

            <div
              className="alert alert-success result-message"
              role="alert"
              id="successMessage"
              style={{
                opacity: successVisible ? 0 : 0,
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "3rem",
                fontWeight: "bold",
                textAlign: "center",
                zIndex: 9999,
                display: successVisible ? "block" : "none",
                animation: successVisible ? "fade-out 3s" : "none",
              }}
            >
              Good job!
            </div>
            <div
              className="alert result-message"
              role="alert"
              id="failMessage"
              style={{
                opacity: failureVisible ? 1 : 0,
                position: "absolute",
                top: "50%",
                left: "50%",
                color: "#0d6efd",
                transform: "translate(-50%, -50%)",
                fontSize: "3rem",
                fontWeight: "bold",
                textAlign: "center",
                zIndex: 9999,
                display: failureVisible ? "block" : "none",

                textShadow: "1px 1px 4px rgba(255, 255, 255, 1.0)",
                animation: failureVisible ? "fade-out 3s" : "none",
              }}
            >
              Score
              <br />+{guessResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
