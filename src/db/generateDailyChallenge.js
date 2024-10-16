// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
} from 'firebase/firestore/lite';

import getCurrentDateInBritain from '../utils/getCurrentDateinBritain';
import firestoreKey from './auth.json';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
if (!firestoreKey) {
  throw new Error('Firestore key not found');
}
const app = initializeApp(firestoreKey);
const db = getFirestore(app);

async function generateDailyChallenge(day) {
  // Get the songs collection
  const songsCollection = collection(db, 'songs');

  // Query all the songs
  const songsQuery = query(songsCollection);

  // Get all the songs
  const songsSnapshot = await getDocs(songsQuery);

  // Create an array to store the randomized songs
  const randomizedSongs = [];

  // Assign a random integer to each song
  songsSnapshot.forEach((songDoc) => {
    const songData = songDoc.data();
    const randomInteger = Math.floor(Math.random() * 1000);
    const randomizedSong = {
      ...songData,
      randomInteger,
    };
    randomizedSongs.push(randomizedSong);
  });

  // Shuffle the array of randomized songs
  randomizedSongs.sort(() => Math.random() - 0.5);

  // Get the current date in format YYYY-MM-DD
  const currentDate = getCurrentDateInBritain();
  console.log(randomizedSongs.slice(0, 5));
  console.log(currentDate);
  // Create the 'day' document with the randomized songs and current date
  const dayDoc = doc(db, 'day', day);
  await setDoc(
    dayDoc,
    {
      songs: randomizedSongs.slice(0, 5),
      date: currentDate,
    },
    { merge: true },
  );
}

await generateDailyChallenge('2024-05-21');
