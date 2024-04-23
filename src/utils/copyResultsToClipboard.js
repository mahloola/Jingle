export function copyResultsToClipboard(dailyResults) {
    const sum = dailyResults.reduce((acc, result) => acc + parseInt(result), 0);
    // Copy the results to the clipboard
    navigator.clipboard.writeText(
        `I scored ${sum} on today's Jingle challenge! Can you beat me? https://jingle.rs\n\n` +
        dailyResults.map((result) => result === "0" ? "0 🔴" : result === "1000" ? "1000 🟢" : result + " 🟡").join("\n")
    );
}