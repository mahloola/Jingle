import { useRef } from "react";
import { DailyChallenge, GameState, GameStatus } from "../types/jingle";
import RunescapeMap from "./RunescapeMap";
import {
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
  postDailyChallengeResult,
} from "../data/jingle-api";
import { getCurrentDateInBritain } from "../utils/date-utils";
import { sum } from "ramda";
import HomeButton from "./HomeButton";
import DailyGuessLabel from "./DailyGuessLabel";
import Footer from "./Footer";
import "../style/uiBox.css";
import { match } from "ts-pattern";
import RoundResult from "./RoundResult";
import useGameLogic, { Guess } from "../hooks/useGameLogic";
import GameOver from "./GameOver";
import { keys } from "../data/localstorage";
import { copyResultsToClipboard, getJingleNumber } from "../utils/jingle-utils";
import SettingsButton from "./SettingsButton";
import NewsButton from "./NewsButton";
import StatsButton from "./StatsButton";

interface DailyJingleProps {
  dailyChallenge: DailyChallenge;
}
export default function DailyJingle({ dailyChallenge }: DailyJingleProps) {
  const jingleNumber = getJingleNumber(dailyChallenge);
  const loadGameState = (): GameState | null => {
    const gameStateJson = localStorage.getItem(keys.gameState(jingleNumber));
    try {
      const gameState = JSON.parse(gameStateJson ?? "null");
      return gameState;
    } catch (e) {
      console.error("Failed to parse saved game state: " + gameState);
      return null;
    }
  };
  const saveGameState = (gameState: GameState) => {
    localStorage.setItem(
      keys.gameState(jingleNumber),
      JSON.stringify(gameState),
    );
  };
  const jingle = useGameLogic(dailyChallenge, loadGameState());
  const gameState = jingle.gameState;

  const guess = (guess: Guess) => {
    const gameState = jingle.guess(guess);
    saveGameState(gameState);

    // update statistics
    incrementGlobalGuessCounter();
    const currentSong = gameState.songs[gameState.round];
    if (guess.correct) incrementSongSuccessCount(currentSong);
    else incrementSongFailureCount(currentSong);

    const isLastRound = gameState.round === gameState.songs.length - 1;
    if (isLastRound) {
      // submit daily challenge
      localStorage.setItem(keys.dailyComplete, getCurrentDateInBritain());
      postDailyChallengeResult(sum(gameState.scores));
    }
  };

  const endGame = () => {
    const gameState = jingle.endGame();
    saveGameState(gameState);
  };

  const audioRef = useRef<HTMLAudioElement>(null);
  const nextSong = () => {
    const gameState = jingle.nextSong();
    saveGameState(gameState);

    // play next song
    const songName = gameState.songs[gameState.round];
    const src = `https://mahloola.com/${songName.trim().replace(/ /g, "_")}.mp3`;
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
            <div style={{ display: "flex", gap: "2px" }}>
              <DailyGuessLabel number={gameState.scores[0]} />
              <DailyGuessLabel number={gameState.scores[1]} />
              <DailyGuessLabel number={gameState.scores[2]} />
              <DailyGuessLabel number={gameState.scores[3]} />
              <DailyGuessLabel number={gameState.scores[4]} />
            </div>

            {match(gameState.status)
              .with(GameStatus.Guessing, () =>
                button("Place your pin on the map"),
              )
              .with(GameStatus.AnswerRevealed, () => {
                if (gameState.round < gameState.songs.length - 1) {
                  return button("Next Song", nextSong);
                } else {
                  return button("End Game", endGame);
                }
              })
              .with(GameStatus.GameOver, () =>
                button("Copy Results", () => copyResultsToClipboard(gameState)),
              )
              .exhaustive()}

            <audio controls id="audio" ref={audioRef} />

            <Footer />
          </div>
        </div>
      </div>

      <RunescapeMap gameState={gameState} onGuess={guess} />

      <RoundResult gameState={gameState} />

      {gameState.status === GameStatus.GameOver && (
        <GameOver gameState={gameState} dailyChallenge={dailyChallenge} />
      )}
    </>
  );
}
