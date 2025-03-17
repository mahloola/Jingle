import "../style/statsButton.css";

export default function StatsButton() {
  return (
    <div
      className="stats-btn-container"
      onClick={() => window.location.reload()}
    />
  );
}
