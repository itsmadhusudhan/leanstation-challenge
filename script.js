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
	
/**
 * a small observer pattern library I made to watch and update the favourite list UI
 * it has only 
 * one object events to store call backs
 * watch()=> watches an event to occur and pushes the callback to that event name array
 * emit()=> when some change event occurs it calls the callbacks of that event and passes the data to them
 * clear()=> when it is called it clears the event name array 
 */
const Pubsub={
	events:{},
	watch:function(eventName,cb){
		console.log(eventName)
		this.events[eventName]=this.events[eventName]||[];
		this.events[eventName].push(cb)
	},
	emit:function(eventName,data){
		console.log(eventName)
		if(this.events[eventName] && this.events[eventName].length!==0){
			this.events[eventName].forEach(event=>event(data))
		}
	},
	clear:function(eventName){
		console.log(eventName)
		if(this.events[eventName]){
			this.events[eventName]=[];
		}
	}
}

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
		Pubsub.emit("updated favourites",favouriteList)
		// fetchFavourites()
		console.log(Pubsub.events)		
    console.log(favouriteList);
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
  const closeModal = (e) => {
    modal.classList.remove("i-tune__modal--active");
    modalContent.classList.remove("i-tune__modal--content-active");
    modalContent.innerHTML = "";
  };

	/**
	 * 
	 * @param {*} e 
	 */
  const handleSearchResults = e => {
    const value = e.target.value;
    value
      ? getSearchResults(value).then(tunes => processResults(tunes))
			: (results.innerHTML = "");
		fetched=false;
		Pubsub.clear('updated favourites')
  };

  /**
   *
   * @param {*} e
   */
  const handleClick = e => {
		e.stopPropagation()
    const trackId = e.target.getAttribute("data-track-id");
    let proceed =
      !e.target.classList.contains("i-tune__card--favourite") &&
      trackId !== null
        ? true
        : false;
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
		fetched = true;
		console.log("renderfavourites: "+fetched)		
  };

	/**
	 * fetches the favouritelist trackids by resolving all promises at once
	 */
  const fetchFavourites = () => {
		console.log("fetchfavourites: "+fetched)
		console.log(Pubsub.events)
		Pubsub.watch('updated favourites',fetchFavourites)
		search.value="";
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

	/**
	 * main function that adds events on search, modal and list and calls callback
	 */
  const init = () => {
    search.addEventListener("keyup", handleSearchResults);
    modal.addEventListener("click", closeModal);
    list.addEventListener("click", fetchFavourites);
  };
  init();
})();

