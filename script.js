const url = 'https://itunes.apple.com/search?term=';
const url2 = 'https://itunes.apple.com/lookup?id=';

/* query and keep dom nodes of search and results node */
const search = document.querySelector('.i-search');
const results = document.querySelector('.i-results');

// empty array to store favourtite track list
let favouriteList = [];

/**
 * @param {number} milliSeconds
 * @returns {string}
 */
const milliSecondsToMinutes = milliSeconds => `${Math.floor(milliSeconds / 60000)}m`;


/**
 *
 * @param {Object[]} cardResults
 * @returns {String}
 */
const createTuneCard = cardResults => cardResults.map(result => `
    <div class="i-tune__card"  data-track-id=${result.trackId}>
    <img src=${result.artworkUrl100} class="i-tune__card--image"/>
    <div class="i-tune__card--details" data-track-id=${result.trackId}>
      <h3 class="i-tune__card--title" data-track-id=${result.trackId}>${result.trackCensoredName}</h3>
      <p class="i-tune__card--album" data-track-id=${result.trackId}>${result.collectionName}</p>
      <p class="i-tune__card--album" data-track-id=${result.trackId}>${milliSecondsToMinutes(result.trackTimeMillis)}</p>
      </div>
      <p class="i-tune__card--favourite"  data-track-id=${result.trackId}>add to favourite</p>
    </div>`).join('');

/**
 *
 * @param {Object[]} details
 * @return {String}
 */
const createTuneDetailsModal = details => details.map(result => `
    <div class="i-tune__card--modal">
    <h2 class="i-tune__card--title">${result.trackCensoredName}</h2>
      <h2 class="i-tune__card--title" data-track-id=${result.trackId}>${result.trackId}</h2>
    </div>`).join('');

/**
 *
 * @param {number[]} list
 * @param {number} id
 * @returns {number[]}
 */
const filterFavourites = (list, id) => {
  console.log(list.includes(id));
  return list.includes(id) ? list.filter(track => track !== id) : [...list, id];
};

/**
 *  * @param {*} e
 */
const handleFavourites = (e) => {
  const trackId = e.target.getAttribute('data-track-id');
  favouriteList = filterFavourites(favouriteList, trackId);
  // console.log(favouriteList);
};

/**
 *
 * @param {*} data
 */
const processResults = (data) => {
  const html = createTuneCard(data.results);
  results.innerHTML = html;
  const cards = document.querySelectorAll('.i-tune__card');
  cards.forEach(card => card.addEventListener('click', handleClick));
  const favouriteBtn = document.querySelectorAll('.i-tune__card--favourite');
  favouriteBtn.forEach(btn => btn.addEventListener('click', handleFavourites));
};

/**
 *
 * @param {*} data
 */
const ProcessTuneDetails = (data) => {
  console.log(data);
  // const html=createTuneDetailsModal(data.results);
};

/*
 * * @param {*} e
 */
const getSearchResults = (e) => {
  const value = e.target.value;
  value ? fetch(`${url + value}&media=music&entity=song`)
    .then(res => res.json())
    .then((tunes) => {
      processResults(tunes);
    })
    .catch(err => console.log(err)) : results.innerHTML = '';
};

/**
 *
 * @param {number} trackId
 */
const getTrackDetails = (trackId) => {
  // console.log(trackId);
  trackId && fetch(url2 + trackId)
    .then(res => res.json())
    .then((details) => {
      ProcessTuneDetails(details);
    })
    .catch(err => console.log(err));
};

/**
 *
 * @param {*} e
 */
const handleClick = (e) => {
  const trackId = e.target.getAttribute('data-track-id');
  getTrackDetails(trackId);
};


search.addEventListener('keyup', getSearchResults);
