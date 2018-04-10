/* global document:true, mapboxgl: true, window: true */

import $ from 'jquery';
import dirkCareer from './career-tour';
import './furniture';

$(document).ready(() => {

  // global variable to hold dirk's data so we can access it
  let dirkData = [];

  let map;

  // ================================================
  // CREATING FULL TEAM NAMES FROM ABBREVIATION
  // ================================================

  function getTeam(abv) {
    // arrays of team abbreviations and full names
    const teams = [
      ['SEA', 'Seattle SuperSonices'],
      ['GSW', 'Golden State Warriors'],
      ['SAS', 'San Antonio Spurs'],
      ['UTA', 'Utah Jazz'],
      ['HOU', 'Houston Rockets'],
      ['DEN', 'Denver Nuggets'],
      ['VAN', 'Vancouver Grizzlies'],
      ['POR', 'Portland Trailblazers'],
      ['LAL', 'Los Angeles Lakers'],
      ['LAC', 'Los Angeles Clippers'],
      ['PHX', 'Phoenix Suns'],
      ['ATL', 'Atlanta Hawks'],
      ['SAC', 'Sacramento Kings'],
      ['ORL', 'Orlando Magic'],
      ['NJN', 'New Jersey Nets'],
      ['DET', 'Detroit Pistons'],
      ['MIN', 'Minnesota Timberwolves'],
      ['MIA', 'Miami Heat'],
      ['CHI', 'Chicago Bulls'],
      ['CHH', 'Charlotte Hornets'],
      ['NYK', 'New York Knicks'],
      ['CLE', 'Cleveland Cavaliers'],
      ['MIL', 'Milwaukee Bucks'],
      ['TOR', 'Toronto Raptors'],
      ['WAS', 'Washington Wizards'],
      ['PHI', 'Philadelphia 76ers'],
      ['IND', 'Indiana Pacers'],
      ['BOS', 'Boston Celtics'],
      ['MEM', 'Memphis Grizzlies'],
      ['NOH', 'New Orleans Hornets'],
      ['CHA', 'Charlotte Bobcats'],
      ['OKC', 'Oklahoma City Thunder'],
      ['BKN', 'Brooklyn Nets'],
      ['NOP', 'New Orleans Pelicans'],
    ];

    let team = '';

    // iterate through each team abbreviation/name array and see if it includes
    // the passed abbreviation
    $.each(teams, (k, v) => {
      if (v.includes(abv)) {
        // if it does, assign the full team name to the team variable
        team = v[1];
      }
    });

    return team;
  }

  // ===========================================================================
  // REMOVING THE MILESTONE LAYERS

  // checks if the milestone sources and layers exist, and if they do, removes them
  // ===========================================================================

  function removeMilestones() {
    if (map.getSource('dirkFilter') !== undefined) {
      map.removeSource('dirkFilter');
    }
    if (map.getLayer('dirkFilteredShots') !== undefined) {
      map.removeLayer('dirkFilteredShots');
    }
  }

  // ===========================================================================
  // RESETING THE CIRCLE PROPERTIES

  // resets the shots back to their original properties
  // ===========================================================================

  function resetCircleProps() {
    map.setPaintProperty('dirkShots', 'circle-opacity', 0.5);
    map.setPaintProperty('dirkShots', 'circle-color', {
      property: 'r',
      type: 'categorical',
      stops: [
        [0, '#ff786e'],
        [1, '#329ce8'],
      ],
    });
  }


  // SETTING UP THE BOUNDRIES FOR THE MAP

  // the goal dirk is shooting at is at 0, 0 long/lat
  // const ne = new mapboxgl.LngLat(0.00068589196, 0.00015089623);
  // const sw = new mapboxgl.LngLat(-0.00068589196, -0.0011385806);

  const ne = new mapboxgl.LngLat(0.00088589196, 0.00020089623);
  const sw = new mapboxgl.LngLat(-0.00088589196, -0.0013385806);
  // const sw = new mapboxgl.LngLat(-0.00088589196, -0.0014385806);

  // these coordinates ar wrong.
  // const backne = new mapboxgl.LngLat(0.00068589196, -0.0011375806);
  // const backsw = new mapboxgl.LngLat(-0.00068589196, -0.00242805955);

  const backne = new mapboxgl.LngLat(0.00088589196, -0.0009375806);
  const backsw = new mapboxgl.LngLat(-0.00088589196, -0.00262805955);

  const halfcourtMaxBounds = new mapboxgl.LngLatBounds(sw, ne);
  const backcourt = new mapboxgl.LngLatBounds(backsw, backne);

  let originalZoomLevel = 0;


  /*
  --------------------------------------------------------------------------------
  DRAWING THE DATA ON THE COURT
  --------------------------------------------------------------------------------
  */

  function drawMap(data) {
    map.addSource('dirkData', {
      type: 'geojson',
      data,
    });

    map.addLayer({
      id: 'dirkShots',
      source: 'dirkData',
      type: 'circle',
      paint: {
        'circle-radius': {
          stops: [[17, 2], [18, 2.4], [19, 2.6], [22, 5]],
        },
        'circle-color': {
          property: 'r',
          type: 'categorical',
          stops: [
            [0, '#ff786e'],
            [1, '#329ce8'],
          ],
        },
        'circle-opacity': 0.5,
      },
    });

    // settingBounds();

    // mousing over a shot location
    map.on('mousemove', (e) => {
      // log all the features at that point
      const features = map.queryRenderedFeatures(e.point, {});

      // if there are features at that point, change the cursor to a pointer
      map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

      // CREATING AN DISPLAYING THE TOOLTIP
      // if we have features at this point, find the top most one. this will be the
      // most recent shot by date
      if (features.length) {
        // assing the properties of the top-most feature to the const f
        const f = features[0].properties;

        // populate the tooltip with that feature's data
        $('#tt-date').text(f.gda.toLowerCase());
        // we hand off the opponent abbreviation to our getTeam function, which returns
        // the actual full team name
        $('#tt-opp').text(getTeam(f.opp));
        $('#tt-result').text(f.r === 1 ? 'Made shot' : 'Missed shot');
        $('#tt-type').text(f.st);
        $('#tt-distance').text(f.sd);
        $('#tt-id').text(f.id);

        // grabbing the width of the tooltip. we'll use this to alter our tooltip
        // position when the tooltip will display on the right side of the screen.
        // this is to prevent the tooltip from going offscreen on far right points.
        const ttWidth = $('#tooltip').outerWidth();

        // use the clientX position in relation to the window width to position the
        // tooltip to the left or right of the point hovered over.
        const w = $(window).width();
        const xPos = e.originalEvent.clientX > (w / 2.1) ?
          e.originalEvent.clientX - (ttWidth - 10) :
          e.originalEvent.clientX - 10;
        const yPos = e.originalEvent.clientY + 10;

        // set the position then display the tooltip
        $('#tooltip').attr('style', `left: ${xPos}px; top: ${yPos}px`)
          .removeClass('no-show');
      } else {
        // if we're not currently over a point, hide the tooltip
        $('#tooltip').addClass('no-show');
      }
    });

    originalZoomLevel = map.getZoom();
  }

  // ---------------------------------
  // **** end drawMap ****
  // ---------------------------------


  /*
  --------------------------------------------------------------------------------
  PREPARING THE MAP
  --------------------------------------------------------------------------------
  */

  function prepareMap(data) {
    // determining whether we're dealing with small screen or not
    // const windowWidth = $(window).width();
    // const isSmallScreen = windowWidth <= 737;

    // our new map object, with the target container, the bounds (which are the coordinates
    // of our court, and the styles that apply the court background)
    map = new mapboxgl.Map({
      container: 'shot-chart',
      style: 'data/styles.json',
      maxBounds: halfcourtMaxBounds,
      maxZoom: 22,
      trackResize: true,
    });

    // disabling the scroll zoom. Scroll zoom is bad. BAD!
    map.scrollZoom.disable();

    // new navigation control that is added to the top left corner
    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-right');

    // once the map has loaded, draw the map with dirk's data
    map.on('load', () => {
      drawMap(data);
    });
  }

  // ---------------------------------
  // **** end prepareMap ****
  // ---------------------------------


  /*
  --------------------------------------------------------------------------------
  CHECKING THE NUMBERS (COMMENT THIS OUT FOR PRODUCTION)
  --------------------------------------------------------------------------------
  */

  // function checkNumbersByYear(data) {
  //   console.log(data);
  //   const years = ['1998-99', '1999-00', '2000-01', '2001-02', '2002-03', '2003-04', '2004-05', '2005-06', '2006-07', '2007-08', '2008-09', '2009-10', '2010-11', '2011-12', '2012-13', '2013-14', '2014-15', '2015-16', '2016-17', '2017-18']
  //
  //   for (let i = 0; i < years.length; i += 1) {
  //     const year = years[i];
  //     let regularAttempts = 0;
  //     let regularMakes = 0;
  //     let postAttempts = 0;
  //     let postMakes = 0;
  //     data.features.forEach((shot) => {
  //       if (shot.properties.y === year && shot.properties.se_type === 'Regular Season') {
  //         regularAttempts += 1;
  //         regularMakes += shot.properties.r === 0 ? 0 : 1;
  //       } else if (shot.properties.y === year && shot.properties.se_type === 'Playoffs') {
  //         postAttempts += 1;
  //         postMakes += shot.properties.r === 0 ? 0 : 1;
  //       }
  //     });
  //     console.log(year, 'Regular Season: ', regularMakes, '-', regularAttempts);
  //     console.log(year, 'Postseason: ', postMakes, '-', postAttempts);
  //   }
  // }
  //
  // function checkNumbersByGame(year, data) {
  //   const season = data.features.filter(game => game.properties.y === year);
  //   console.log(season);
  //
  //   let gameID = 0;
  //   let fga = 0;
  //   let fgm = 0;
  //   let gDate = '';
  //
  //   season.forEach((shot) => {
  //     if (shot.properties.gid !== gameID) {
  //       console.log(`${gDate}: ${fgm}-${fga}`);
  //       fga = 1;
  //       fgm = shot.properties.r === 0 ? 0 : 1;
  //       gDate = shot.properties.gda;
  //       gameID = shot.properties.gid;
  //     } else {
  //       fga += 1;
  //       fgm += shot.properties.r === 0 ? 0 : 1;
  //     }
  //   });
  //   console.log(`${gDate}: ${fgm}-${fga}`);
  // }
  /*
  --------------------------------------------------------------------------------
  INITIAL DATA CALL AND HAND OFF TO PREPARING THE MAP
  --------------------------------------------------------------------------------
  */

  $.getJSON('./data/dirk_geo_current.json', (data) => {
    dirkData = data;
    prepareMap(data);
    // checkNumbersByYear(data);
    // checkNumbersByGame('1998-99', data);
  });


  /*
  --------------------------------------------------------------------------------
  FILTERING THE DATA VIA
  --------------------------------------------------------------------------------
  */

  // for more information about filtering data with mapboxgl.js, see:
  // https://www.mapbox.com/mapbox-gl-js/api/#map#setfilter
  // https://www.mapbox.com/mapbox-gl-js/style-spec/#types-filter

  function filterData(filters) {
    resetCircleProps();
    removeMilestones();

    // fade the displayed points out
    map.setLayoutProperty('dirkShots', 'visibility', 'none');
    // map.setPaintProperty('dirkShots', 'circle-opacity', 0);

    // apply our filters
    map.setFilter('dirkShots', filters);

    if (filters.length >= 2) {
      map.setPaintProperty('dirkShots', 'circle-opacity', 0.55);
      map.setPaintProperty('dirkShots', 'circle-radius', { stops: [[17, 2], [18, 3.5], [19, 4]] });
    } else {
      map.setPaintProperty('dirkShots', 'circle-opacity', 0.4);
      map.setPaintProperty('dirkShots', 'circle-radius', { stops: [[17, 1], [18, 2.5], [19, 3]] });
    }

    // then after 1.2 seconds, fade our points back in. Large sets of points may
    // need more time to load and be painted.

    setTimeout(() => {
      map.setLayoutProperty('dirkShots', 'visibility', 'visible');
    }, 250);
  }

  // run the filterData function anytime a .filter__container select is changed
  $('.filter__container select').change(() => {
    // starting off our filtering array. "all" is our filtering operator
    const filters = ['all'];

    // iterate through each filter container, and check that it's child select tag
    // does not have the value of 'all'. If it doesn't, grab the select's id, which
    // will be the key in our data that we are filtering by, and the value of the
    // selected option, which is the value of the filtered key. Create a mapboxgl.js
    // filter array, and push it to our filters array

    $.each($('.filter__container'), function () {
      if ($(this).children('select').val() !== 'all') {
        const filterKey = $(this).children('select').attr('id');
        let filterValue = $(this).children('select').val();
        // check if we're filtering on shot results, and if we are, change the filter
        // value back to 1 and 0
        if (filterValue === '1' || filterValue === '0') {
          filterValue = parseInt(filterValue, 10);
        }
        const filter = ['==', filterKey, filterValue];
        filters.push(filter);
      }
    });

    filterData(filters);
  });


  // ===========================================================================
  // CHANGING THE FRONTCOURT/BACKCOURT VIEW

  // flips the court from frontcourt to backcourt based on a button click.
  // action is determined by frontcourt/backcourt class on button
  // ===========================================================================

  function flipCourt(thisObj) {
    console.log(map.getZoom());
    // set our zoom level based on window width when the courtflipper is clicked

    // const windowWidth = $(window).width();
    // const zoomLevel = windowWidth > 1053 ? 17 : 18.19;

    // check for frontcourt/backcourt class on the button, then reorient the map and
    // reset the button text accordingly
    if (thisObj.hasClass('frontcourt')) {
      // set the bounds to the backcourt
      map.setMaxBounds(backcourt);

      // update the class and text of the court flipper button
      thisObj.removeClass('frontcourt')
        .addClass('backcourt')
        .text('Frontcourt');
    } else {
      // update the map with the frontcourt bounds
      map.setMaxBounds(halfcourtMaxBounds);

      // update the class and text of the court flipper button
      thisObj.removeClass('backcourt')
        .addClass('frontcourt')
        .text('Backcourt');
    }
  }

  // when the court-flipper button is clicked, flip the court
  $('#court-flipper').click(function () { flipCourt($(this)); });


  // ===========================================================================
  // RESET THE COURT VIEW

  // resets the court view to its initial zoom level and halfcourt orientation
  // restores all the filters to their original defaults
  // ===========================================================================

  function resetCourt() {
    // flip the nav back to explore mode
    $('.controls').addClass('no-show');
    $('#controls__explore').removeClass('no-show');

    // remove the milestone layers and sources
    removeMilestones();

    // returns circles to original properties
    resetCircleProps();

    // reset the maxBounds and zoom levels of the court
    map.setMaxBounds(halfcourtMaxBounds).setZoom(originalZoomLevel);

    // restore all the dropdowns to their original defaults
    $('#r').val($('#r option:first').val());
    $('#opp').val($('#opp option:first').val());
    $('#sr').val($('#sr option:first').val());
    $('#y').val($('#y option:first').val());


    // refilter the data based on updated drop downs
    filterData(['all']);
  }

  // reset court when the reset-court button is clicked
  $('#court-reset').click(resetCourt);


  // ===========================================================================
  // FINDING AND DISPLAYING MILESTONES

  // takes in a filterValue and filterKey, displays the matching milestone text
  // and adds a new layer to display those milestone shots, fading back all others
  // ===========================================================================

  let milestoneMarker;

  function findMilestone(filterValue, filterKey) {
    // remove any milestone layers and sources already present on the shot chart
    removeMilestones();

    console.log(filterValue, filterKey);
    // create a new geojson variable of just the shots that match the milestone
    const filteredData = {
      type: 'FeatureCollection',
      features: [],
    };
    filteredData.features = dirkData.features.filter(
      shot => shot.properties[filterKey] === filterValue,
    );

    console.log(dirkData.features);
    console.log(filteredData);
    // adds those shots as a source to the shotchart
    map.addSource('dirkFilter', {
      type: 'geojson',
      data: filteredData,
    });

    // create the layer for those shots
    map.addLayer({
      id: 'dirkFilteredShots',
      source: 'dirkFilter',
      type: 'circle',
      paint: {
        'circle-radius': {
          stops: [[17, 3.5], [18, 4.5], [19, 5.5], [22, 6.5]],
        },
        'circle-color': {
          property: 'r',
          type: 'categorical',
          stops: [
            [0, '#ff786e'],
            [1, '#329ce8'],
          ],
        },
        'circle-opacity': 0.9,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff',
      },
    });
  }

  function mapMilestone(i) {
    // sets a filter key based on the milestone type
    const filterKey = dirkCareer[i].milestone_type === 'shot' ? 'id' : 'gid';

    // grabs the filterValue from the .milestone clicked
    const filterValue = dirkCareer[i].milestone_id;

    // fade out and grey out the non-milestone shots
    map.setPaintProperty('dirkShots', 'circle-color', '#d7d7d7');
    map.setPaintProperty('dirkShots', 'circle-opacity', {
      property: 'sd',
      type: 'interval',
      stops: [
        [0, 0.1],
        [1, 0.3],
      ],
    });

    // creates milestone blurb and adds the shots to the shotchart
    findMilestone(filterValue, filterKey);
  }


  // ===========================================================================
  // WINDOWS SCROLL EVENTS

  // As the window scrolls, we listen for the position of the scroll to both lock
  // the court into view and update the milestones as they scroll in
  // ===========================================================================

  $(window).scroll(() => {
    // setting window dimensions
    const scrollTop = $(window).scrollTop();
    const windowHeight = $(window).height();
    const windowBottom = scrollTop + windowHeight;

    // setting scroller and chart dimensions
    const scrollerHeight = $('#dirk-scroller').outerHeight();
    const scrollerTop = $('#dirk-scroller').offset().top;
    const chartHeight = $('#shot-chart').outerHeight();

    // setting waypoints
    const lockStart = scrollerTop - 20;
    const lockEnd = scrollerTop + scrollerHeight;

    // if the scroll is past the top waypoint and hasn't yet reached the end waypoint
    // lock the court into view at the top
    if (scrollTop > lockStart && scrollTop + chartHeight < lockEnd) {
      $('#dirk-graphic').addClass('locked');
      $('#dirk-graphic').removeClass('locked-bottom');
    } else if (scrollTop + chartHeight > lockEnd) {
      // else, if the scroll is past the end waypoint, lock the court into
      // the bottom of the scroller, allowing it to scroll up with the page
      $('#dirk-graphic').addClass('locked-bottom');
    } else {
      // if it doesn't fall into either of those conditions, i.e. the top of the
      // page, unlock the court
      $('#dirk-graphic').removeClass('locked');
      $('#dirk-graphic').removeClass('locked-bottom');
    }

    // placeholder variable for our current milestone in view
    let currentMilestone;

    $.each($('.slide-content'), function () {
      // for each slide, set variables for it's offset top and milestone id
      const slideContentTop = $(this).offset().top;
      const slideMilestone = parseInt($(this).attr('data-milestoneid'), 10);

      // if this slide is above the bottom of the window, update the currentMilestone
      // variable with this slide's milestone number
      if (slideContentTop < windowBottom) {
        currentMilestone = slideMilestone;
      }
    });

    // if the currentMileston differs from the current milestoneMarker, we know
    // we've changed to a new milestone.
    if (currentMilestone !== milestoneMarker) {
      // if the currentMilestone isn't underfined ...
      if (currentMilestone !== undefined) {
        // check to see if the user flipped the court before getting into the Milestones
        // if so, flip it back
        if (currentMilestone >= 0 && milestoneMarker === undefined && $('#court-flipper').hasClass('backcourt') === true) {
          resetCourt();
        }
        // map the current milestone
        mapMilestone(currentMilestone);
        // hide the tooltip
        $('#tooltip').addClass('no-show');
      } else {
        // if the currentMilestone is already defined when the milestone changes
        // it means we've scrolled back to the top and need to reset the court
        resetCourt();
      }
      // update the milestoneMarker with the current Milestone
      milestoneMarker = currentMilestone;
    }
  });
});
