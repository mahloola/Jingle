export function copyResultsToClipboard(resultsArray) {
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

  navigator.clipboard.writeText(
    `I scored ${sum} on today's Jingle challenge! Can you beat me? https://jingle.rs\n\n` +
      resultsString,
  );
}
