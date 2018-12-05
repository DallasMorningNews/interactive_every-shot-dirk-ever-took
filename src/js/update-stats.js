import $ from 'jquery';
import TEAMS from './teams';

export default function (statsObj, data) {
  // function to add commas into numbers that are larger than 999
  const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // plucking off our filter values from the statsObj passed in
  const seasonType = statsObj.se_type;
  const opponent = statsObj.opp;
  const range = statsObj.sr;
  const year = statsObj.y;

  // first check to see if there are no filters selected
  // if not, figure his all time FG-FGA and popuplate the statline accordingly
  if (seasonType === null && opponent === null && range === null && year === null) {
    let madeShots = 0;
    data.forEach((shot) => {
      if (shot.result === 'Made Shot') {
        madeShots += 1;
      }
    });
    // reset the smart text
    $('#statline span').addClass('no-show');
    // update the smart text
    $('.statline__fgs').html(`<strong>${numberWithCommas(madeShots)}</strong> for <strong>${numberWithCommas(data.length)}</strong> from the field for his career`).removeClass('no-show');
    return;
  }

  // our placeholder for our filtered data as we take note of selections made by the user
  let filteredData;

  // first check to see if our season type has been changed. if it has, update the smart
  // text and make a first pass at the filtered data
  if (seasonType !== null) {
    filteredData = data.filter(shot => shot.season_type === seasonType);
    $('.statline__season').removeClass('no-show').html(` in the <strong>${seasonType}</strong>`);
  } else {
    $('.statline__season').addClass('no-show');
    filteredData = data;
  }

  // next, check if an opponent has been selected. if so, filter the data accordingly,
  // pluck out the long name of the opponent, and update the smart text
  if (opponent !== null) {
    filteredData = filteredData.filter(shot => shot.opponent === opponent);
    let fullTeam;
    TEAMS.forEach((team) => {
      if (opponent === team[0]) {
        fullTeam = team[1];
      }
    });
    $('.statline__opponent').removeClass('no-show').html(` against the <strong>${fullTeam}</strong>`);
  } else {
    $('.statline__opponent').addClass('no-show');
  }

  // check if a range has been selected. if so, filter accordingly, clean up the ft./feet
  // listed in the range, and update the smart text
  if (range !== null) {
    filteredData = filteredData.filter(shot => shot.shot_range === range);
    $('.statline__range').removeClass('no-show').html(` from <strong>${range.replace('ft.', 'feet')}</strong>`);
  } else {
    $('.statline__range').removeClass('no-show').text(' from the field');
  }

  // check if a year has been selected. if so, filter accordingly and update the smart text
  if (year !== null) {
    filteredData = filteredData.filter(shot => shot.year === year);
    $('.statline__year').removeClass('no-show').html(` in <strong>${year}</strong>`);
  } else {
    $('.statline__year').addClass('no-show');
  }

  // iterate over the filtered data and count up our made shots
  let madeShots = 0;
  filteredData.forEach((shot) => {
    if (shot.result === 'Made Shot') {
      madeShots += 1;
    }
  });

  // update the smart text with his filtered FG-FGA
  $('.statline__fgs').html(`<strong>${numberWithCommas(madeShots)}</strong> for <strong>${numberWithCommas(filteredData.length)}</strong>`).removeClass('no-show');
}
