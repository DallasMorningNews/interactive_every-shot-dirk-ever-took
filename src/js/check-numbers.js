/*
--------------------------------------------------------------------------------
CHECKING THE NUMBERS (COMMENT THIS OUT FOR PRODUCTION)
--------------------------------------------------------------------------------
*/

function checkNumbersByYear(data) {
  console.log(data);
  const years = ['1998-99', '1999-00', '2000-01', '2001-02', '2002-03', '2003-04', '2004-05', '2005-06', '2006-07', '2007-08', '2008-09', '2009-10', '2010-11', '2011-12', '2012-13', '2013-14', '2014-15', '2015-16', '2016-17', '2017-18'];

  for (let i = 0; i < years.length; i += 1) {
    const year = years[i];
    let regularAttempts = 0;
    let regularMakes = 0;
    let postAttempts = 0;
    let postMakes = 0;
    data.forEach((shot) => {
      if (shot.year === year && shot.season_type === 'Regular Season') {
        regularAttempts += 1;
        regularMakes += shot.result === 'Missed Shot' ? 0 : 1;
      } else if (shot.year === year && shot.season_type === 'Playoffs') {
        postAttempts += 1;
        postMakes += shot.result === 'Missed Shot' ? 0 : 1;
      }
    });
    console.log(year, 'Regular Season: ', regularMakes, '-', regularAttempts);
    console.log(year, 'Postseason: ', postMakes, '-', postAttempts);
  }
}

function checkNumbersByGame(year, data) {
  const season = data.features.filter(game => game.properties.y === year);
  console.log(season);

  let gameID = 0;
  let fga = 0;
  let fgm = 0;
  let gDate = '';

  season.forEach((shot) => {
    if (shot.properties.gid !== gameID) {
      console.log(`${gDate}: ${fgm}-${fga}`);
      fga = 1;
      fgm = shot.properties.r === 0 ? 0 : 1;
      gDate = shot.properties.gda;
      gameID = shot.properties.gid;
    } else {
      fga += 1;
      fgm += shot.properties.r === 0 ? 0 : 1;
    }
  });
  console.log(`${gDate}: ${fgm}-${fga}`);
}

function checkCounts(data) {
  console.log(data);
  let dunks = 0;
  let threes = 0;

  data.forEach((shot) => {
    if (shot.shot_type === 'Dunk Shot') {
      dunks += 1;
    }
    if (shot.shot_value === '3PT Field Goal') {
      threes += 1;
    }
  });

  console.log(dunks, threes);
}

export default { checkNumbersByGame, checkNumbersByYear, checkCounts };
