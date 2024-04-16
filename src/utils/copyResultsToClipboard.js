export function copyResultsToClipboard(dailyResults) {
    // Copy the results to the clipboard
    navigator.clipboard.writeText(
        "I got the following results in today's Jingle challenge! Can you beat my score?\n\n" +
        dailyResults.map((result) => result === "-" ? "0 🔴" : result + (result === "1000" ? " 🟢" : result === "0" ? " 🔴" : " 🟡")).join("\n")
    );
}