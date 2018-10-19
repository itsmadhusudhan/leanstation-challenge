(function() {
  const url = "https://itunes.apple.com/search?term=";
  const url2 = "https://itunes.apple.com/lookup?id=";

  /* query and keep dom nodes of search and results node */
  const search = document.querySelector(".i-search");
  const results = document.querySelector(".i-results");
  const modal = document.querySelector(".i-tune__modal");
  const modalContent = document.querySelector(".i-tune__modal--content");
  const list = document.querySelector(".i-favourite__list");
  let fetchedFavourites = false;

  /**
   * a small observer pattern library I made to watch and update the favourite list UI
   * it has only
   * one object events to store call backs
   * watch()=> watches an event to occur and pushes the callback to that event name array
   * emit()=> when some change event occurs it calls the callbacks
   * of that event and passes the data to them
   * clear()=> when it is called it clears the event name array
   */
  const Pubsub = {
    events: {},
    watch(eventName, cb) {
      this.events[eventName] = this.events[eventName] || [];
      !this.events[eventName].includes(cb) && this.events[eventName].push(cb);
    },
    emit(eventName, data) {
      if (this.events[eventName] && this.events[eventName].length !== 0) {
        this.events[eventName].forEach(event => event(data));
      }
    },
    clear(eventName) {
      if (this.events[eventName]) {
        this.events[eventName] = [];
      }
    }
  };

  // empty array to store favourtite track list
  let favouriteList = JSON.parse(localStorage.getItem("favourites")) || [];

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
      .map(result => {
        const {
          trackId,
          trackCensoredName,
          trackTimeMillis,
          collectionName,
          artistName,
          artworkUrl100
        } = result;
        return `
                <div class="i-tune__card"  data-track-id=${trackId}>
                <img src=${artworkUrl100} class="i-tune__card--image"/>
                <div class="i-tune__card--details">
                <p class="i-meta">Song name:</p>
                  <h3 class="i-tune__card--title">${trackCensoredName}</h3>
                <p class="i-meta">Album name:</p>
                  <p class="i-tune__card--album">${collectionName}</p>
                    <p class="i-meta">Artist Name:</p>
                    <p class="i-tune__card--name">${artistName}</p>
                    <p class="i-meta">Time:</p>
                  <p class="i-tune__card--album">${milliSecondsToMinutes(
    trackTimeMillis,
  )}</p>
        <img src="./images/like.svg" class="i-tune__card--favourite"  data-track-id=${trackId}/>
                  </div>
                </div>`;
      })
      .join("");

  /**
   *
   * @param {Object[]} details
   * @return {String}
   */
  const createTuneDetailsModal = details =>
    details
      .map(result => {
        const {
          trackId,
          trackCensoredName,
          trackTimeMillis,
          collectionName,
          artistName,
          artworkUrl100,
          trackPrice,
          releaseDate
        } = result;
        return `
              <div class="i-tune__card--modal">
              <img src=${artworkUrl100} class="i-tune__card--image"/>
              <div class="i-tune__card--details" data-track-id=${trackId}>
              <p class="i-meta">Song name:</p>
                <h3 class="i-tune__card--title" data-track-id=${trackId}>${trackCensoredName}</h3>
              <p class="i-meta">Album name:</p>
                <p class="i-tune__card--album" data-track-id=${trackId}>${collectionName}</p>
                  <p class="i-meta">Artist Name:</p>
                  <p class="i-tune__card--name">${artistName}</p>
                  <p class="i-meta">Release Year:</p>
                  <p class="i-tune__card--name">${releaseDate.split("-")[0]}</p>
                  <p class="i-meta">Price:</p>
                  <p class="i-tune__card--name">${trackPrice}</p>
                  <p class="i-meta">Time:</p>
                <p class="i-tune__card--album" data-track-id=${trackId}>${milliSecondsToMinutes(
          trackTimeMillis
        )}</p>
                </div>
              </div>
              </div>`;
      })
      .join("");

  /**
   *
   * @param {number[]} list
   * @param {number} id
   * @returns {number[]}
   */
  // eslint-disable-next-line
  const filterFavourites = (myList, id) =>
    myList.includes(id)
      ? myList.filter(track => track !== id)
      : [...myList, id];

  /**
   *  * @param {*} e
   */
  const handleFavourites = (e) => {
    const trackId = e.currentTarget.getAttribute('data-track-id');
    e.currentTarget.classList.toggle('i-tune__card--favourite-liked');
    favouriteList = JSON.parse(localStorage.getItem('favourites')) || [];
    favouriteList = filterFavourites(favouriteList, trackId);
    localStorage.setItem("favourites", JSON.stringify(favouriteList));
    fetchedFavourites = false;
    Pubsub.emit('updated favourites', favouriteList);
  };

  /**
   * initiales the events on  dom elements of card
   */
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
    const html = createTuneDetailsModal(data.results);
    modalContent.innerHTML = html;
    const modalClose = document.querySelector(".i-modal__close");
    modalClose.addEventListener("click", closeModal);
  };

  /**
   * * @param {*} e
   */
  const getSearchResults = value =>
    fetch(`${url + value}&media=music&entity=song`)
      .then(res => res.json())
      .then(tunes => tunes)
      .catch(err => console.log(err));

  /**
   *
   * @param {number} trackId
   */
  const getTrackDetails = trackId =>
    trackId &&
    fetch(url2 + trackId)
      .then(res => res.json())
      .then(details => details)
      .catch(err => console.log(err));

  /**
   * it opens the modal by adding classes
   */
  const openModal = () => {
    modal.classList.add("i-tune__modal--active");
    modalContent.classList.add("i-tune__modal--content-active");
  };

  /**
   *
   * @param {Node} e
   * closes the modal by removing classes
   */
  const closeModal = e => {
    modal.classList.remove("i-tune__modal--active");
    modalContent.classList.remove("i-tune__modal--content-active");
    modalContent.innerHTML = "";
  };

  /**
   *
   * @param {*} e
   */
  const handleSearchResults = (e) => {
    const value = e.currentTarget.value;
    value
      ? getSearchResults(value).then(tunes => processResults(tunes))
      : (results.innerHTML = "");
    fetchedFavourites = false;
    Pubsub.clear("updated favourites");
  };

  /**
   *
   * @param {*} e
   */
  const handleClick = (e) => {
    const trackId = e.currentTarget.getAttribute('data-track-id');
    const proceed = !!(
      !e.target.classList.contains("i-tune__card--favourite") &&
      trackId !== null
    );
    proceed &&
      getTrackDetails(trackId).then(details => ProcessTuneDetails(details));
    proceed && openModal();
  };

  /**
   *
   * @param {Object} details
   * takes details object and renders
   */
  const renderFavourites = details => {
    const favhtml = details
      .map(detail => createTuneCard(detail.results))
      .join("");
    results.innerHTML = favhtml;
    initCardEvents();
    fetchedFavourites = true;
  };

  const cleanTrackId = tid => tid.replace("/", "");

  /**
   * fetches the favouritelist trackids by resolving all promises at once
   */
  const fetchFavourites = () => {
    Pubsub.watch("updated favourites", fetchFavourites);
    console.log(Pubsub.events);
    search.value = "";
    if (favouriteList.length !== 0) {
      const promises =
        !fetchedFavourites &&
        favouriteList.map(favourite =>
          getTrackDetails(cleanTrackId(favourite))
        );
      !fetchedFavourites &&
        Promise.all(promises).then(details => renderFavourites(details));
    } else {
      results.innerHTML = "no favourites";
    }
  };


  /**
   * main function that adds events on search, modal and list and calls callback
   */
  const init = () => {
    search.addEventListener("keyup", handleSearchResults);
    modal.addEventListener("click", closeModal);
    list.addEventListener("click", fetchFavourites);
  };
  init();


}());

