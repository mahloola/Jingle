import React from "react";

const DailyGuessLabel = ({ number, opacity }) => {
  return (
    <div style={{ position: "relative", opacity: {opacity}}}>
      <img
        src={process.env.PUBLIC_URL + "../assets/osrsButton.png"}
        alt="OSRS Button"
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "18px",
          fontStyle: "italic",
          fontFamily: "Runescape UF",
          color: "#edfd07",
        }}
      >
        {number}
      </div>
    </div>
  );
}

export default DailyGuessLabel;