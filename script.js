(function() {
  const url = "https://itunes.apple.com/search?term=";
  const url2 = "https://itunes.apple.com/lookup?id=";

  /* query and keep dom nodes of search and results node */
  const search = document.querySelector(".i-search");
  const results = document.querySelector(".i-results");
  const modal = document.querySelector(".i-tune__modal");
  const modalContent = document.querySelector(".i-tune__modal--content");
  const list = document.querySelector(".i-favourite__list");
  let fetched = false;

  // empty array to store favourtite track list
  let favouriteList = JSON.parse(localStorage.getItem("favourites")) || [];
  console.log(favouriteList);

  /**
   * @param {number} milliSeconds
   * @returns {string}
   */
  const milliSecondsToMinutes = milliSeconds =>
    `${Math.floor(milliSeconds / 60000)}m`;

  /**
   *
   * @param {Object[]} cardResults
   * @returns {String}
   */
  const createTuneCard = cardResults =>
    cardResults
      .map(
        result => `
    <div class="i-tune__card"  data-track-id=${result.trackId}>
    <img src=${result.artworkUrl100} class="i-tune__card--image"/>
    <div class="i-tune__card--details" data-track-id=${result.trackId}>
      <h3 class="i-tune__card--title" data-track-id=${result.trackId}>${
          result.trackCensoredName
        }</h3>
      <p class="i-tune__card--album" data-track-id=${result.trackId}>${
          result.collectionName
        }</p>
      <p class="i-tune__card--album" data-track-id=${
        result.trackId
      }>${milliSecondsToMinutes(result.trackTimeMillis)}</p>
      </div>
      	<img src="./images/like.svg" class="i-tune__card--favourite"  data-track-id=${
          result.trackId
        }></img>
    </div>`
      )
      .join("");

  /**
   *
   * @param {Object[]} details
   * @return {String}
   */
  const createTuneDetailsModal = details =>
    details
      .map(
        result => `
    <div class="i-tune__card--modal">
<img src=${result.artworkUrl100} class="i-tune__card--image"/>
<div class="i-tune__card--details" data-track-id=${result.trackId}>
	<h3 class="i-tune__card--title" data-track-id=${result.trackId}>${
          result.trackCensoredName
        }</h3>
	<p class="i-tune__card--album" data-track-id=${result.trackId}>${
          result.collectionName
        }</p>
	<p class="i-tune__card--album" data-track-id=${
    result.trackId
  }>${milliSecondsToMinutes(result.trackTimeMillis)}</p>
	</div>
    </div>`
      )
      .join("");

  /**
   *
   * @param {number[]} list
   * @param {number} id
   * @returns {number[]}
   */
  const filterFavourites = (list, id) => {
    return list.includes(id)
      ? list.filter(track => track !== id)
      : [...list, id];
  };

  /**
   *  * @param {*} e
   */
  const handleFavourites = e => {
    const trackId = e.target.getAttribute("data-track-id");
    favouriteList = JSON.parse(localStorage.getItem("favourites")) || [];
    favouriteList = filterFavourites(favouriteList, trackId);
    localStorage.setItem("favourites", JSON.stringify(favouriteList));
    fetched = false;
    // fetchFavourites()
    console.log(favouriteList);
  };

  const initCardEvents = () => {
    const cards = document.querySelectorAll(".i-tune__card");
    cards.forEach(card => card.addEventListener("click", handleClick));
    const favouriteBtn = document.querySelectorAll(".i-tune__card--favourite");
    favouriteBtn.forEach(btn =>
      btn.addEventListener("click", handleFavourites)
    );
  };

  /**
   *
   * @param {*} data
   */
  const processResults = data => {
    const html = createTuneCard(data.results);
    results.innerHTML = html;
    initCardEvents();
  };

  /**
   *
   * @param {*} data
   */
  const ProcessTuneDetails = data => {
    console.log(data);
    const html = createTuneDetailsModal(data.results);
    modalContent.innerHTML = html;
    const modalClose = document.querySelector(".i-modal__close");
    modalClose.addEventListener("click", closeModal);
  };

  /**
   * * @param {*} e
   */
  const getSearchResults = value => {
    return fetch(`${url + value}&media=music&entity=song`)
      .then(res => res.json())
      .then(tunes => tunes)
      .catch(err => console.log(err));
  };

  /**
   *
   * @param {number} trackId
   */
  const getTrackDetails = trackId => {
    // console.log(trackId);
    return (
      trackId &&
      fetch(url2 + trackId)
        .then(res => res.json())
        .then(details => details)
        .catch(err => console.log(err))
    );
  };

  const openModal = () => {
    modal.classList.add("i-tune__modal--active");
    modalContent.classList.add("i-tune__modal--content-active");
  };

  const closeModal = () => {
    modal.classList.remove("i-tune__modal--active");
    modalContent.classList.remove("i-tune__modal--content-active");
    modalContent.innerHTML = "";
  };

  const handleSearchResults = e => {
    const value = e.target.value;
    value
      ? getSearchResults(value).then(tunes => processResults(tunes))
      : (results.innerHTML = "");
  };

  /**
   *
   * @param {*} e
   */
  const handleClick = e => {
    const trackId = e.target.getAttribute("data-track-id");
    // console.log(trackId);
    let proceed =
      !e.target.classList.contains("i-tune__card--favourite") &&
      trackId !== null
        ? true
        : false;
    proceed &&
      getTrackDetails(trackId).then(details => ProcessTuneDetails(details));
    proceed && openModal();
  };

  const renderFavourites = details => {
    const favhtml = details
      .map(detail => createTuneCard(detail.results))
      .join("");
    results.innerHTML = favhtml;
    initCardEvents();
    fetched = true;
  };

  const fetchFavourites = () => {
    if (favouriteList.length !== 0) {
      let promises =
        !fetched &&
        favouriteList.map(favourite => {
          return getTrackDetails(favourite);
        });
      !fetched &&
        Promise.all(promises).then(details => renderFavourites(details));
    }
    else{
      results.innerHTML="no favourites"
    }
  };

  const init = () => {
    search.addEventListener("keyup", handleSearchResults);
    modal.addEventListener("click", closeModal);
    list.addEventListener("click", fetchFavourites);
  };

  init();
})();
