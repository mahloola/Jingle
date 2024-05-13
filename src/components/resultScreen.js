import React from "react";
import { copyResultsToClipboard } from "../utils/copyResultsToClipboard";

function ResultScreen({ dailyResults }) {
  console.log(dailyResults);
  const totalResult = dailyResults.reduce((a, b) => a + b, 0);
  return (
    <>
      <div className="result-screen result-screen-results">
        <table style={{ minWidth: "35vw" }}>
          <tr>
            <td style={{ textAlign: "left" }}>Score</td>
            <td>{totalResult}</td>
          </tr>
          <tr>
            <td style={{ textAlign: "left" }}>Percentile</td>
            <td>1.7%</td>
          </tr>
        </table>
      </div>
      <div className="main-menu-container">
        <div
          onClick={copyResultsToClipboard(dailyResults)}
          style={{ top: "80%", left: "50%" }}
          className="main-menu-option"
        >
          Share Results
        </div>
        <div style={{ top: "100%", left: "50%" }} className="main-menu-option">
          <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
            Practice Mode
          </a>
        </div>
      </div>
    </>
  );
}

export default ResultScreen;
