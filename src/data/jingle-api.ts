import {
  DailyChallenge,
  LobbySettings,
  MultiGameState,
  MultiLobby,
  Song,
  Statistics,
} from '../types/jingle';

const apiHost = import.meta.env.VITE_API_HOST;
class FetchError extends Error {
  response: Response;
  constructor(response: Response) {
    super(response.statusText);
    this.name = 'FetchError';
    this.response = response;
  }
}

async function get<T = any>(path: string, token?: string) {
  const response = await fetch(apiHost + path);
  if (response.ok) {
    return (await response.json()) as T;
  } else {
    throw new FetchError(response);
  }
}

async function post<T = any>(path: string, body: any, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(apiHost + path, {
    method: 'POST',
    headers,
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

export async function createLobby({
  name,
  settings,
  token,
}: {
  name: string;
  settings: LobbySettings;
  token: string;
}) {
  return await post('/api/lobbies', { name, settings }, token);
}

export async function joinLobby({ lobbyId, token }: { lobbyId: string; token: string }) {
  if (!lobbyId) return;
  return await post(`/api/lobbies/${lobbyId}/join`, { lobbyId }, token);
}

export async function leaveLobby({ lobbyId, token }: { lobbyId: string; token: string }) {
  if (!lobbyId) return;
  return await post(`/api/lobbies/${lobbyId}/leave`, { lobbyId }, token);
}

export async function startLobby({ lobbyId, token }: { lobbyId: string; token: string }) {
  if (!lobbyId) return;
  return await post(`/api/lobbies/${lobbyId}/start`, { lobbyId }, token);
}

export async function confirmGuess({ lobbyId, token }: { lobbyId: string; token: string }) {
  if (!lobbyId) return;
  return await post(`/api/lobbies/${lobbyId}/confirmGuess`, { lobbyId }, token);
}

export async function getLobby(id: string | undefined) {
  return await get(`/api/lobbies/${id}`);
}

export async function getLobbyState({ lobbyId, token }: { lobbyId: string; token: string }) {
  if (!lobbyId) return;
  return await get<MultiGameState>(`/api/lobbies/${lobbyId}/gameState`, token);
}

export async function getLobbies() {
  return await get<MultiLobby[]>(`/api/lobbies`);
}

export async function getAverages() {
  return await get(`/api/averages`);
}

export async function getSongList() {
  return await get<Song[]>('/api/songs');
}

export async function getDailyChallenge(formattedDate: string) {
  return await get<DailyChallenge>(`/api/daily-challenges/${formattedDate}`);
}

export async function getWeekStats() {
  const weekDatesFormatted = [
    '2024-05-27',
    '2024-05-28',
    '2024-05-29',
    '2024-05-30',
    '2024-05-31',
    '2024-06-01',
    '2024-06-02',
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

interface DailyChallengeResponse {
  percentile: number;
}
export async function postDailyChallengeResult(
  score: number,
  timeTakenMs: number,
): Promise<DailyChallengeResponse> {
  // Returns the percentile
  return await post<DailyChallengeResponse>(`/api/daily-challenge/result`, { score, timeTakenMs });
}

export async function getStatistics() {
  return await get<Statistics>('/api/statistics');
}

export async function incrementGlobalGuessCounter() {
  await post('/api/statistics/increment', {});
}

export async function incrementSongSuccessCount(songName: string) {
  await post(`/api/songs/${songName}/success`, {});
}

export async function incrementSongFailureCount(songName: string) {
  await post(`/api/songs/${songName}/failure`, {});
}
