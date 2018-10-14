const url = "https://itunes.apple.com/search?term=";
const url2="https://itunes.apple.com/lookup?id="

let data = [];
const search = document.querySelector('.i-search');
const results = document.querySelector('.i-results');
const favouriteList=[];

const getSearchResults = (e) => {
  const value = e.target.value;
  value && fetch(url + value + "+&media=music&entity=song")
    .then(res => res.json())
    .then(tunes => {
      data.push(tunes.results)
      console.log(data)
      processResults(tunes)
    })
    .catch(err => console.log(err))
}

const getTrackDetails=(trackId)=>{
  console.log(trackId)
  trackId && fetch(url2+trackId)
  .then(res => res.json())
  .then(details => {
    ProcessTuneDetails(details)
  })
  .catch(err => console.log(err))
}

const createTuneCard = (results) => {
  return results.map(result=>{
    return `
    <div class="i-tune__card"  data-track-id=${result.trackId}>
      <h2 class="i-tune__card--title">${result.trackCensoredName}</h2>
      <p class="i-tune__card--trackid">${result.trackId}</p>
      <p class="i-tune__card--album">${result.collectionName}</p>
      <p class="i-tune__card--album">${milliSecondsToMinutes(result.trackTimeMillis)}</p>
    </div>`
  }).join('');

}

const createTuneDetailsModal=(results)=>{
  return results.map(result=>{
    return `
    <div class="i-tune__card--modal">
    <h2 class="i-tune__card--title">${result.trackCensoredName}</h2>
      <h2 class="i-tune__card--title" data-track-id=${result.trackId}>${result.trackId}</h2>
    </div>`
  }).join('');
}

const handleClick=function(e){
  console.log(e.currentTarget)
  const trackId=e.target.getAttribute('data-track-id');
  getTrackDetails(trackId);
}

const processResults = data => {
  const html = createTuneCard(data.results);
  results.innerHTML=html;
  const cards=document.querySelectorAll('.i-tune__card');
  cards.forEach(card=>card.addEventListener('click',handleClick))
}

const ProcessTuneDetails=data=>{
  console.log(data)
  // const html=createTuneDetailsModal(data.results);
}

const milliSecondsToMinutes=(milliSeconds)=>{
  return Math.floor(milliSeconds/60000)+"m"
}


// console.log(data)
search.addEventListener('keyup', getSearchResults)