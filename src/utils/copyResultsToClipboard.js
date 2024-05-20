export function copyResultsToClipboard(resultsArray, time, percentile) {
  const sum = resultsArray.reduce((acc, result) => acc + parseInt(result), 0);
  let resultsString = '';
  for (let i = 0; i < resultsArray.length; i++) {
    const result = resultsArray[i] || 0;
    resultsString +=
      result === 0 ? '0 🔴' : result === 1000 ? '1000 🟢' : result + ' 🟡';
    if (i !== resultsArray.length - 1) {
      resultsString += '\n';
    }
  }

  if (percentile && time) {
    navigator.clipboard.writeText(
      `I scored ${sum} on today's Jingle challenge! I finished in ${time} and placed in the top ${percentile}%, can you beat me? https://jingle.rs\n\n` +
        resultsString,
    );
  } else {
    navigator.clipboard.writeText(
      `I scored ${sum} on today's Jingle challenge, can you beat me? https://jingle.rs\n\n` +
        resultsString,
    );
  }
}
