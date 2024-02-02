import React, { useRef } from "react";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import * as songs from "./songs";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import RunescapeMap from "./Map";

function App() {
  const maxSongs = 728;
  const audioRef = useRef(null);
  const sourceRef = useRef(null);
  const [random, setRandom] = useState(
    Math.floor((Math.random() * maxSongs) / 2) * 2
  );
  const keys = Object.keys(songs);
  let name = keys[random];
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
    console.log(`Currently playing ${name}`);
  }, [song]);

  return (
    <div className="App">
      <div className="content">
        <div className={`content ${!startedGame ? "blur" : ""}`}>
          <RunescapeMap currentSong={name} />
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
              <Button
                variant="primary"
                onClick={function () {
                  
                }}
              >
                Guess
              </Button>

              {/* song button */}
              <Button
                variant="secondary"
                className="songButton"
                onClick={() => {
                  setRandom(() => { // use the functional form of setRandom to avoid waiting for the state to update
                    const newRandom = Math.floor((Math.random() * maxSongs) / 2) * 2;
                    const newName = keys[newRandom];
                    setSong(
                      `https://oldschool.runescape.wiki/images/${newName.replaceAll(
                        " ",
                        "_"
                      )}.ogg`
                    );
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
              style={{
                display: "flex",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                className="alert alert-success result-message"
                role="alert"
                id="successMessage"
                style={{
                  opacity: successVisible ? 1 : 0,
                }}
              >
                Well done, you got it!
              </div>
              <div
                className="alert alert-danger result-message"
                role="alert"
                id="failMessage"
                style={{
                  opacity: failureVisible ? 1 : 0,
                }}
              >
                Incorrect, try again!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
