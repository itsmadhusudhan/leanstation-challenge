const url = "https://itunes.apple.com/search?term=";
const url2 = "https://itunes.apple.com/lookup?id="

let data = [];
const search = document.querySelector('.i-search');
const results = document.querySelector('.i-results');

const favouriteList = [];
let loading = true;
const getSearchResults = (e) => {
  const value = e.target.value;
  value ? fetch(url + value + "&media=music&entity=song")
    .then(res => res.json())
    .then(tunes => {
      processResults(tunes)
    })
    .catch(err => console.log(err)) : results.innerHTML = "";
}

const getTrackDetails = (trackId) => {
  console.log(trackId)
  trackId && fetch(url2 + trackId)
    .then(res => res.json())
    .then(details => {
      ProcessTuneDetails(details)
    })
    .catch(err => console.log(err))
}

const createTuneCard = (results) => {
  return results.map(result => {
    return `
    <div class="i-tune__card"  data-track-id=${result.trackId}>
    <img src=${result.artworkUrl100} class="i-tune__card--image"/>
    <div class="i-tune__card--details" data-track-id=${result.trackId}>
      <h3 class="i-tune__card--title" data-track-id=${result.trackId}>${result.trackCensoredName}</h3>
      <p class="i-tune__card--album" data-track-id=${result.trackId}>${result.collectionName}</p>
      <p class="i-tune__card--album" data-track-id=${result.trackId}>${milliSecondsToMinutes(result.trackTimeMillis)}</p>
      </div>
    </div>`
  }).join('');

}

const createTuneDetailsModal = (results) => {
  return results.map(result => {
    return `
    <div class="i-tune__card--modal">
    <h2 class="i-tune__card--title">${result.trackCensoredName}</h2>
      <h2 class="i-tune__card--title" data-track-id=${result.trackId}>${result.trackId}</h2>
    </div>`
  }).join('');
}

const handleClick = function (e) {
  const trackId = e.target.getAttribute('data-track-id');
  getTrackDetails(trackId);
}

const processResults = data => {
  const html = createTuneCard(data.results);
  results.innerHTML = html;
  const cards = document.querySelectorAll('.i-tune__card');
  cards.forEach(card => card.addEventListener('click', handleClick))
}

const ProcessTuneDetails = data => {
  console.log(data)
  // const html=createTuneDetailsModal(data.results);
}

const milliSecondsToMinutes = (milliSeconds) => {
  return Math.floor(milliSeconds / 60000) + "m"
}


// console.log(data)
search.addEventListener('keyup', getSearchResults);

