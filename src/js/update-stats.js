import $ from 'jquery';
import TEAMS from './teams';

export default function (statsObj, data) {
  console.log(data);
  // function to add commas into numbers that are larger than 999
  const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // plucking off our filter values from the statsObj passed in
  const seasonType = statsObj.se_type;
  const opponent = statsObj.opp;
  const range = statsObj.sr;
  const year = statsObj.y;

  // first check to see if there are no filters selected
  if (seasonType === null && opponent === null && range === null && year === null) {
    let madeShots = 0;
    data.forEach((shot) => {
      if (shot.result === 'Made Shot') {
        madeShots += 1;
      }
    });
    $('.statline__fgs').html(`<strong>${numberWithCommas(madeShots)}</strong> for <strong>${numberWithCommas(data.length + 1)}</strong> from the field for his career`).removeClass('no-show');
    return;
  }

  let filteredData;

  if (seasonType !== null) {
    filteredData = data.filter(shot => shot.season_type === seasonType);
    $('.statline__season').removeClass('no-show').html(` in the <strong>${seasonType}</strong>`);
  } else {
    $('.statline__season').addClass('no-show');
    filteredData = data;
  }

  if (opponent !== null) {
    filteredData = filteredData.filter(shot => shot.opponent === opponent);
    console.log(opponent);
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

  if (range !== null) {
    filteredData = filteredData.filter(shot => shot.shot_range === range);
    $('.statline__range').removeClass('no-show').html(` from <strong>${range.replace('ft.', 'feet')}</strong>`);
  } else {
    $('.statline__range').removeClass('no-show').text(' from the field');
  }

  if (year !== null) {
    filteredData = filteredData.filter(shot => shot.year === year);
    $('.statline__year').removeClass('no-show').html(` in <strong>${year}</strong>`);
  } else {
    $('.statline__year').addClass('no-show');
  }

  let totalShots = filteredData.length + 1;

  if (opponent !== null && opponent !== 'DEN') {
    totalShots -= 1;
  } else if (year !== null || year !== '1998-99') {
    totalShots -= 1;
  } else if (seasonType !== null || seasonType !== 'Regular Season') {
    totalShots -= 1;
  }

  console.log(filteredData);

  let madeShots = 0;
  filteredData.forEach((shot) => {
    if (shot.result === 'Made Shot') {
      madeShots += 1;
    }
  });

  $('.statline__fgs').html(`<strong>${numberWithCommas(madeShots)}</strong> for <strong>${numberWithCommas(totalShots)}</strong>`).removeClass('no-show');
}
