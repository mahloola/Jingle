import "../style/settingsButton.css";

export default function SettingsButton() {
  return (
    <div
      className="settings-btn-container"
      onClick={() => window.location.reload()}
    />
  );
}
