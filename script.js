const url = "https://itunes.apple.com/search?term=";
const url2 = "https://itunes.apple.com/lookup?id="

let data = [];
const search = document.querySelector('.i-search');
const results = document.querySelector('.i-results');

let favouriteList = [];
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
      <p class="i-tune__card--favourite"  data-track-id=${result.trackId}>add to favourite</p>
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

const handleFavourites = (e) => {
  const trackId = e.target.getAttribute('data-track-id');
  favouriteList=filterFavourites(favouriteList, trackId)
  console.log(favouriteList)
}

const filterFavourites = (list, id) => {
  console.log(list.includes(id));
  return list.includes(id) ? list.filter(track => track !== id) : [...list,id];  
}

const processResults = data => {
  const html = createTuneCard(data.results);
  results.innerHTML = html;
  const cards = document.querySelectorAll('.i-tune__card');
  cards.forEach(card => card.addEventListener('click', handleClick));
  const favouriteBtn = document.querySelectorAll('.i-tune__card--favourite');
  favouriteBtn.forEach(btn => btn.addEventListener('click', handleFavourites))
}

const ProcessTuneDetails = data => {
  console.log(data)
  // const html=createTuneDetailsModal(data.results);
}

const milliSecondsToMinutes = (milliSeconds) => {
  return Math.floor(milliSeconds / 60000) + "m"
}

search.addEventListener('keyup', getSearchResults);

