import "../style/homeButton.css";

function HomeButton() {
  return (
    <div
      className="home-btn-container"
      onClick={() => {
        window.location.reload();
      }}
    ></div>
  );
}

export default HomeButton;
