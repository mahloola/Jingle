const apiUrl = 'http://159.203.48.137:8080';

export async function getSong(songName) {
  const response = await fetch(`${apiUrl}/api/songs/${songName}`);
  if (response.ok) {
    return response.json();
  } else {
    return null; // Handle the error as needed
  }
}

export async function generateDailyChallenge(date) {
  const response = await fetch(`${apiUrl}/api/daily-challenge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ date }),
  });

  if (response.ok) {
    console.log(`Daily challenge successfully generated for ${date}`);
  } else {
    console.error('Failed to generate daily challenge');
  }
}

export async function getDailyChallenge(formattedDate) {
  const response = await fetch(
    `${apiUrl}/api/daily-challenges/${formattedDate}`,
  );
  if (response.ok) {
    return response.json();
  } else {
    console.error('Failed to fetch daily challenge');
    return null;
  }
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
  const weekStats = [];

  for (const date of weekDatesFormatted) {
    const dailyChallenge = await getDailyChallenge(date);
    const results = dailyChallenge?.results ?? [];
    const average = results.reduce((a, b) => a + b, 0) / results.length;

    const songSuccessRates = {};
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

export async function getDailyChallengePercentileAndIncrement(result) {
  const response = await fetch(`${apiUrl}/api/daily-challenge/result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ result }),
  });

  if (response.ok) {
    return response.json(); // Returns the percentile
  } else {
    console.error('Failed to submit and get percentile');
    return null;
  }
}

export async function getStatistics() {
  const response = await fetch(`${apiUrl}/api/statistics`);
  if (response.ok) {
    return response.json();
  } else {
    console.error('Failed to fetch statistics');
    return null;
  }
}

export async function incrementGlobalGuessCounter() {
  const response = await fetch(`${apiUrl}/statistics/increment`, {
    method: 'POST',
  });

  if (response.ok) {
    console.log('Global guess counter incremented');
  } else {
    console.error('Failed to increment global guess counter');
  }
}

export async function incrementSongSuccessCount(songName) {
  const response = await fetch(`${apiUrl}/songs/${songName}/success`, {
    method: 'POST',
  });

  if (response.ok) {
    console.log(`${songName} success count incremented`);
  } else {
    console.error('Failed to increment song success count');
  }
}

export async function incrementSongFailureCount(songName) {
  const response = await fetch(`${apiUrl}/songs/${songName}/success`, {
    method: 'POST',
  });

  if (response.ok) {
    console.log(`${songName} success count incremented`);
  } else {
    console.error('Failed to increment song success count');
  }
}

export function calculateSuccessRate(song) {
  if (!song) return 0;
  const successRate = song.successRate ?? 0;
  const totalGuesses = song.successCount + song.failureCount;
  const successRateAverage =
    (successRate * totalGuesses + successRate) / (totalGuesses + 1).toFixed(3);
  return successRateAverage;
}
