export default function (date) {
  // split our game date into [month, date, year]
  const splitDate = date.split(' ');

  // pluck out the month and convert it to the correct ap format
  const month = splitDate[0];
  let convertedMonth;
  switch (month) {
    case 'mar':
      convertedMonth = 'March';
      break;
    case 'apr':
      convertedMonth = 'April';
      break;
    case 'may':
      convertedMonth = 'May';
      break;
    case 'jun':
      convertedMonth = 'June';
      break;
    case 'jul':
      convertedMonth = 'July';
      break;
    default:
      convertedMonth = `${month}.`;
  }

  // single digit days are preceeded by a 0, so we pluck that off if it exits
  let convertedDay = splitDate[1];
  if (splitDate[1][0] === '0') {
    convertedDay = splitDate[1].substr(1);
  }

  // return the corrected date
  return `${convertedMonth} ${convertedDay} ${splitDate[2]}`;
}
