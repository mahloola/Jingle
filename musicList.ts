const fs = require('fs');
const songCount = 727;
const songDirectory = "./data.csv";

function getSong() {
    const buffer = fs.readFileSync(songDirectory);
    const fileContent = buffer.toString();
    const fileContentSplit = fileContent.split(/,[^\s]/);
    let songUnlocks : string[] = [];
    const songNames : string[] = [];
    let songsCSV = '';
    let songsJSON = '';
    for (let i = 0; i < fileContentSplit.length; i++) {
        const songUnlock = fileContentSplit[(i * 3) + 1];
        if (songUnlock) {
            if (songUnlock[0] === 'U') {
                songUnlocks.push(songUnlock);
            } else {
                const newWord = 'U' + songUnlock;
                songUnlocks.push(newWord);
            }
        }
        const songName = fileContentSplit[(i * 3)];
        if (songName) {
            songNames.push(songName.substring(11));
        }
    }
    songsCSV += `7th Realm,${songUnlocks[0]}\n`
    for (let i = 1; i < songNames.length - 2; i++) {
        songsCSV += `${songNames[i + 1]},${songUnlocks[i + 1]}\n`
    }
    songsJSON += '{';
    songsJSON += `"7th Realm": "${songUnlocks[0]}"`
    for (let i = 1; i < songNames.length - 2; i++) {
        songsJSON += `"${songNames[i + 1].replace('"', '')}": "${songUnlocks[i + 1].replace('"', '')}", `
    }
    songsJSON += '}';
    console.log(songsJSON);
    const random = Math.floor(Math.random() * songCount + 1);
    fs.writeFile("songsJSON.csv", songsCSV, (err) => {
        if (err)
            console.log(err);
        else {
            console.log("File written successfully\n");
        }
    });
    fs.writeFile("src/songs.JSON", songsJSON, (err) => {
        if (err)
            console.log(err);
        else {
            console.log("File written successfully\n");
        }
    });

    return [songNames[random], songUnlocks[random]];
}
getSong();