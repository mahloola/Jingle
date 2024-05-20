export default function getJingleNumber(dailyChallenge) {
  const dailyChallengeDate = dailyChallenge.date;
  const currentDate = new Date(dailyChallengeDate);
  const targetDate = new Date("2024-05-17");
  return (currentDate - targetDate) / (1000 * 60 * 60 * 24);
}
