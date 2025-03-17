import "../style/newsButton.css";

export default function NewsButton() {
  return (
    <div
      className="news-btn-container"
      onClick={() => window.location.reload()}
    />
  );
}
