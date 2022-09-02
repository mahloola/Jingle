import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import * as songs from './songs';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
function App() {

  const [random, setRandom] = useState(Math.floor(Math.random() * 728 / 2) * 2);
  const keys = Object.keys(songs)
  const name = keys[random];
  const songUnlock = songs[name];
  const [input, setInput] = useState('');
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);
  const [song, setSong] = useState(name);
  const [hint, setHint] = useState(songUnlock);

  useEffect(() => {
    let audioHTML = document.getElementById("audio");
    let sourceHTML = document.getElementById("source");
    let hintHTML = document.getElementById("hint");
    hintHTML.innerHTML = hint;
    sourceHTML.src = song;
    audioHTML.load();
    audioHTML.play();
    console.log(song);
  });
  return (
    <div className="App" >
      <div className="content">
        <Alert variant="info" className="hintAlert">
          <Alert.Heading>Hint</Alert.Heading>
          <p id="hint">
          </p>
        </Alert>
        <br />
        <audio controls id="audio">
          <source id="source" src={`https://oldschool.runescape.wiki/images/${name.replaceAll(' ', '_')}.ogg`} type="audio/ogg"></source>
        </audio>
        <br />
        <div id="guessText">
          {/* onChange={(e) => setInput(e.target.value)} */}
          <input type="text" id="guess" ></input>
        </div>
        <div className="buttons">
          {/* guess button */}
          {/* disabled={input.length < 4}  */}
          <Button variant="primary" onClick={function () {
            const userGuess = document.getElementById("guess").value;
            const songString = song.substring(40).replaceAll('_', ' ');
            if (songString.toLowerCase().includes(userGuess.toLowerCase()) && userGuess.length > 2) {
              setSuccess("true");
              document.getElementById("guess").value = '';
              setRandom(Math.floor(Math.random() * 728 / 2) * 2);
              setSong(`https://oldschool.runescape.wiki/images/${name.replaceAll(' ', '_')}.ogg`);
              setHint(`${songUnlock}`)
            } else {
              setFailure("true");
            }
            console.log(userGuess);
          }}>Guess</Button>

          {/* song button */}
          <Button variant="secondary" className="songButton" onClick={function () {
            setRandom(Math.floor(Math.random() * 728 / 2) * 2);
            setHint(`${songUnlock}`);
            setSong(`https://oldschool.runescape.wiki/images/${name.replaceAll(' ', '_')}.ogg`);
            const resultMessage = document.getElementById("resultMessage");
            resultMessage.innerHTML = '';
          }
          }>
            Skip
          </Button>
        </div>
        {success && <div class="alert alert-success" role="alert" id="successMessage" style={{ display: 'block', animation: 'fade 2s linear forwards' }}>
          Well done, you got it!
        </div>}
        {failure && <div class="alert alert-danger" role="alert" id="failMessage" style={{ display: 'block', animation: 'fade 2s linear forwards' }}>
          Incorrect, try again!
        </div>}

      </div>
    </div >
  );
}

export default App;
