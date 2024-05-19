const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const songs = require(`../songs.json`);
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
console.log(songs);
const songsArray = Object.keys(songs);
const urls = songsArray.map(
  (song) =>
    `https://oldschool.runescape.wiki/images/${song.replace(/\s/g, '_')}.ogg`,
);

async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function convertOggToMp3(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('mp3')
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}

async function processFiles(urls) {
  const songsDir = path.resolve(__dirname, 'songs');

  // Ensure the /songs directory exists
  if (!fs.existsSync(songsDir)) {
    fs.mkdirSync(songsDir);
  }

  for (const url of urls) {
    const fileName = url.split('/').pop().replace('.ogg', '');
    const oggPath = path.join(songsDir, `${fileName}.ogg`);
    const mp3Path = path.join(songsDir, `${fileName}.mp3`);

    console.log(`Downloading ${url}...`);
    await downloadFile(url, oggPath);

    console.log(`Converting ${fileName}.ogg to ${fileName}.mp3...`);
    await convertOggToMp3(oggPath, mp3Path);

    console.log(`Finished processing ${fileName}`);
  }
}

processFiles(urls)
  .then(() => {
    console.log('All files processed successfully');
  })
  .catch((err) => {
    console.error('Error processing files:', err);
  });
