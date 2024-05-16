export function copyResultsToClipboard(dailyResults) {
  const sum = dailyResults.reduce((acc, result) => acc + parseInt(result), 0);
  let resultsString = '';
  for (let i = 0; i < dailyResults.length; i++) {
    const result = dailyResults[i] || 0;
    resultsString +=
      result === 0 ? '0 🔴' : result === 1000 ? '1000 🟢' : result + ' 🟡';
    if (i !== dailyResults.length - 1) {
      resultsString += '\n';
    }
  }

  navigator.clipboard.writeText(
    `I scored ${sum} on today's Jingle challenge! Can you beat me? https://jingle.rs\n\n` +
      resultsString,
  );
}
