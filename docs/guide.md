# A guide on building Lean Station chanllenge site

This is just a simple Javascript app built without focusing much on UI and UX.

The only thing considered was functionality specified in the assignment.

## Functionalities:

1. Searchbox to search songs

2. Results are displayed as a list of cards

3. Additional details are displayed as a modal when clicked

4. Ability to add songs to the favourite list

5. Favourite list is viewed by making it persist in local storage

NOTE: Site works best in chrome and firefox and not in older browsers and IE as ES6 is not transpiled to ES5

## Api's used to get data

https://itunes.apple.com/search?term=[value]&media=music&entity=song
https://itunes.apple.com/lookup?id=""


## Coding Decisions

1. Functional programming

  I have built most of the functions to be pure so that they don't modify outside scope variables.

2. Leverage on Promises(asynchronous)

  Promise(fetch) is used to make the ajax requests even batch requests are handled with Promise.all

3. Well commented out code

  Where ever needed the code has been commented out well and fucntion names are self explainatory

4. IIFE

  IIFE is used to wrap the entire code by not polluting the global name space

5. Observer pattern

  Observer pattern is used render favouritelist UI as the list changes

6. Responsive design

  App is made as much responsive as possible with CSS grid, flexbox and media queries.

7. Linted  with ES-Lint

  I have even implemented eslint to fix some of the errors

## Overall Experience

I have enjoyed a lot building this project.

Made me think in lot many ways to make the UI as reusable as possible.

Observer pattern is the best thing I have leveraged so far building UI.

More time was consumed in making decision as to how to structure the app.

I got to explore some real world bugs



