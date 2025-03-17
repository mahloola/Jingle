import { useEffect, useState } from "react";
import "../style/resultMessage.css";
import { GameState, GameStatus } from "../types/jingle";

interface ResultMessageProps {
  gameState: GameState;
}

export default function RoundResult({ gameState }: ResultMessageProps) {
  const resultVisible = gameState.status === GameStatus.AnswerRevealed;
  const [guessResult, setGuessResult] = useState<number>(0);
  const [correctSong, setCorrectSong] = useState<string>(gameState.songs[0]);
  useEffect(() => {
    if (gameState.status === GameStatus.AnswerRevealed) {
      setCorrectSong(gameState.songs[gameState.round]);
      setGuessResult(gameState.scores[gameState.round]);
    }
  }, [gameState]);

  return (
    <div
      className="alert result-message"
      role="alert"
      style={{
        opacity: resultVisible ? 1 : 0,
        transition: "opacity 500ms, margin-top 500ms ease-in-out",
        marginTop: resultVisible ? "-60px" : "0px",
        color:
          guessResult === 1000
            ? "#00FF00"
            : guessResult === 0
              ? "#FF0000"
              : "#edfd07",
      }}
    >
      +{guessResult}
      <div style={{ fontSize: "70%" }}>{correctSong}</div>
    </div>
  );
}
