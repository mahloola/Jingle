import React from "react";
import { copyResultsToClipboard } from "../utils/copyResultsToClipboard";

function ResultScreen({ dailyResults }) {
  console.log(dailyResults);
  const totalResult = dailyResults.reduce((a, b) => a + b, 0);

  return (
    <div className="result-screen">
      <table style={{minWidth: "35vw"}}>
        <tr>
          <td style={{textAlign: "left"}}>Score</td>
          <td>{totalResult}</td>
        </tr>
        <tr>
          <td style={{textAlign: "left"}}>Percentile</td>
          <td>1.7%</td>
        </tr>
        <br />
        <tr className="main-menu-container">
          <td style={{textAlign: "left"}}>
            <div onClick={copyResultsToClipboard} className="main-menu-option">
              Share Results
            </div>
          </td>
          <td>
            <div href="/" className="main-menu-option">
              Practice Mode
            </div>
          </td>
        </tr>
      </table>
    </div>
  );
}

export default ResultScreen;
