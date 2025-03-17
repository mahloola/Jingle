import { useRef, useState } from "react";
import { GameState, GameStatus } from "../types/jingle";
import RunescapeMap from "./RunescapeMap";
import HomeButton from "./HomeButton";
import Footer from "./Footer";
import "../style/uiBox.css";
import { match } from "ts-pattern";
import RoundResult from "./RoundResult";
import { Guess } from "../hooks/useGameLogic";
import { getRandomSong } from "../utils/getRandomSong";
import {
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
} from "../data/jingle-api";
import NewsButton from "./NewsButton";
import SettingsButton from "./SettingsButton";
import StatsButton from "./StatsButton";

export default function Practice() {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.Guessing,
    round: 0,
    songs: [getRandomSong()],
    scores: [],
    startTime: Date.now(),
    timeTaken: null,
    guessedPosition: null,
    correctPolygon: null,
  });

  const guess = (guess: Guess) => {
    const score = Math.round(
      guess.correct ? 1000 : (1000 * 1) / Math.exp(0.0018 * guess.distance),
    );

    // update statistics
    incrementGlobalGuessCounter();
    const currentSong = gameState.songs[gameState.round];
    if (guess.correct) incrementSongSuccessCount(currentSong);
    else incrementSongFailureCount(currentSong);

    setGameState((prev) => ({
      ...prev,
      status: GameStatus.AnswerRevealed,
      scores: [...prev.scores, score],
      guessedPosition: guess.guessedPosition,
      correctPolygon: guess.correctPolygon,
    }));
  };

  const audioRef = useRef<HTMLAudioElement>(null);
  const nextSong = () => {
    const newSong = getRandomSong();
    setGameState((prev) => ({
      ...prev,
      round: prev.round + 1,
      status: GameStatus.Guessing,
      songs: [...prev.songs, newSong],
    }));

    // play next song
    const src = `https://mahloola.com/${newSong.trim().replace(/ /g, "_")}.mp3`;
    audioRef.current!.src = src;
    audioRef.current!.load();
    audioRef.current!.play();
  };

  const button = (label: string, onClick?: () => any) => (
    <div
      className="guess-btn-container"
      onClick={onClick}
      style={{ pointerEvents: onClick ? "auto" : "none" }}
    >
      <img src="https://mahloola.com/osrsButtonWide.png" alt="OSRS Button" />
      <div className="guess-btn">{label}</div>
    </div>
  );

  return (
    <>
      <div className="App-inner">
        <div className="ui-box">
          <HomeButton />
          <SettingsButton />
          <NewsButton />
          <StatsButton />
          <div className="below-map">
            {match(gameState.status)
              .with(GameStatus.Guessing, () =>
                button("Place your pin on the map"),
              )
              .with(GameStatus.AnswerRevealed, () =>
                button("Next Song", nextSong),
              )
              .with(GameStatus.GameOver, () => {
                throw new Error("Unreachable");
              })
              .exhaustive()}

            <audio controls id="audio" ref={audioRef} />

            <Footer />
          </div>
        </div>
      </div>

      <RunescapeMap gameState={gameState} onGuess={guess} />

      <RoundResult gameState={gameState} />
    </>
  );
}
