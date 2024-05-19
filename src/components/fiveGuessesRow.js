import React from "react";
import DailyGuessLabel from "./DailyGuessLabel";

const FiveGuessesRow = ({dailyResults}) => {
    console.log(dailyResults)
  return (
    <table
      style={{
        marginBottom: "10px",
        width: "100%",
        pointerEvents: "none",
      }}
    >
      <tbody>
        <tr>
          <td>
            <DailyGuessLabel number={dailyResults[0] || "-"} />
          </td>
          <td>
            <DailyGuessLabel number={dailyResults[1] || "-"} />
          </td>
          <td>
            <DailyGuessLabel number={dailyResults[2] || "-"} />
          </td>
          <td>
            <DailyGuessLabel number={dailyResults[3] || "-"} />
          </td>
          <td>
            <DailyGuessLabel number={dailyResults[4] || "-"} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default DailyGuessLabel;
