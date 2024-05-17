export default function getCurrentDateInBritain() {
  // Create a new Date object
  const now = new Date();

  // Format the date for the Europe/London timezone
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/London',
  };
  const dateFormatter = new Intl.DateTimeFormat('en-GB', options);

  // Format the date
  const formattedDate = dateFormatter.format(now);

  // Convert the formatted date to the desired YYYY-MM-DD format
  const [day, month, year] = formattedDate.split('/');

  return `${year}-${month}-${day}`;
}
