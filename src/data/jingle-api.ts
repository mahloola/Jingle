import { DailyChallenge, Song, Statistics } from "../types/jingle";

const apiHost = import.meta.env.VITE_API_HOST;

class FetchError extends Error {
  response: Response;
  constructor(response: Response) {
    super(response.statusText);
    this.name = "FetchError";
    this.response = response;
  }
}

async function get<T = any>(path: string) {
  const response = await fetch(apiHost + path);
  if (response.ok) {
    return (await response.json()) as T;
  } else {
    throw new FetchError(response);
  }
}

async function post<T = any>(path: string, body: any) {
  const response = await fetch(apiHost + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (response.ok) {
    return (await response.json()) as T;
  } else {
    throw new FetchError(response);
  }
}

export async function getSong(songName: string) {
  return await get(`/api/songs/${songName}`);
}

export async function generateDailyChallenge(date: string) {
  await post(`/api/daily-challenge`, { date });
}

export async function getDailyChallenge(formattedDate: string) {
  return await get<DailyChallenge>(`/api/daily-challenges/${formattedDate}`);
}

export async function getWeekStats() {
  const weekDatesFormatted = [
    "2024-05-27",
    "2024-05-28",
    "2024-05-29",
    "2024-05-30",
    "2024-05-31",
    "2024-06-01",
    "2024-06-02",
  ];
  const weekStats: {
    date: string;
    submissions: number;
    average: number;
    songSuccessRates: Record<string, string>;
  }[] = [];

  for (const date of weekDatesFormatted) {
    const dailyChallenge = await getDailyChallenge(date);
    const results = dailyChallenge?.results ?? [];
    const average = results.reduce((a, b) => a + b, 0) / results.length;

    const songSuccessRates: Record<string, string> = {};
    for (const songName of dailyChallenge.songs) {
      const song = await getSong(songName);
      const songSuccessRate = (
        (song.successCount / (song.successCount + song.failureCount)) *
        100
      ).toFixed(1);
      songSuccessRates[song.name] = songSuccessRate;
    }

    weekStats.push({
      date: date,
      submissions: dailyChallenge.submissions,
      average: average,
      songSuccessRates,
    });
  }

  return weekStats;
}

export async function postDailyChallengeResult(result: number) {
  // Returns the percentile
  return await post<number>(`/api/daily-challenge/result`, { result });
}

export async function getStatistics() {
  return await get<Statistics>("/api/statistics");
}

export async function incrementGlobalGuessCounter() {
  await post("/statistics/increment", {});
}

export async function incrementSongSuccessCount(songName: string) {
  await post(`/songs/${songName}/success`, {});
}

export async function incrementSongFailureCount(songName: string) {
  await post(`/songs/${songName}/failure`, {});
}
