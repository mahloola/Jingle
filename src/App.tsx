import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./style/leaflet.css";
import { useState } from "react";
import MainMenu from "./components/MainMenu";
import { match } from "ts-pattern";
import DailyJingle from "./components/DailyJingle";
import useSWR from "swr";
import { getCurrentDateInBritain } from "./utils/date-utils";
import { getDailyChallenge } from "./data/jingle-api";
import Practice from "./components/Practice";

enum Screen {
  MainMenu = "main-menu",
  DailyJingle = "daily-jingle",
  Practice = "practice",
}

function App() {
  const { data: dailyChallenge } = useSWR(
    `/api/daily-challenges/${getCurrentDateInBritain()}`,
    () => getDailyChallenge(getCurrentDateInBritain()),
  );
  const [screen, setScreen] = useState<Screen>(Screen.MainMenu);

  return (
    <div
      className="App"
      style={{
        backgroundImage: `url(/assets/background.jpg)`,
        backgroundSize: "cover",
      }}
    >
      {match(screen)
        .with(Screen.MainMenu, () => (
          <MainMenu
            dailyChallenge={dailyChallenge}
            onDailyJingleClick={() => setScreen(Screen.DailyJingle)}
            onPracticeClick={() => setScreen(Screen.Practice)}
          />
        ))
        .with(
          Screen.DailyJingle,
          () =>
            dailyChallenge && <DailyJingle dailyChallenge={dailyChallenge} />,
        )
        .with(Screen.Practice, () => <Practice />)
        .exhaustive()}
    </div>
  );
}

export default App;
