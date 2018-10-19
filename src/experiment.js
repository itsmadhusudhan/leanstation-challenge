(function() {
  const createStore = function(initialState) {
    const pubsub = new Pubsub();
    let currentState = initialState;
    function getState() {
      return currentState;
    }

    function emit(eventName, handler) {
      currentState = handler(currentState);
      pubsub.emit(eventName, currentState[eventName]);
    }

    function watch(eventName, cb) {
      pubsub.watch(eventName, cb);
    }

    function clear(eventName) {
      pubsub.clear(eventName);
    }

    function unsubscribe(eventName, cb) {
      pubsub.unsubscribe(eventName, cb);
    }
    function commit(payload, cb) {
      currentState =
        typeof payload === "function"
          ? { ...this.getState(), ...payload() }
          : { ...this.getState(), ...payload };
      typeof cb === "function"
        ? pubsub.emit("state change", cb)
        : pubsub.emit("state change", currentState);
    }

    function compose() {}
    return { getState, compose, emit, watch, clear, unsubscribe, commit };
  };
  return (window.createStore = createStore);
})();

const Pubsub = function() {
  let pubsub = {
    _ispubsub: true,
    counter: 0,
    events: {},
    watch(eventName, cb) {
      this.events[eventName] = this.events[eventName] || [];
      !this.events[eventName].includes(cb) && this.events[eventName].push(cb);
      return "watch_" + this.counter++;
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
    },
    unsubscribe(eventName, cb) {
      if (this.events[eventName]) {
        this.events[eventName] = this.events[eventName].filter(fn => cb !== fn);
      }
    }
  };

  return pubsub;
};

const store = new createStore({ mydata: "madhu" });

// const something = mydata => {
//   console.log(mydata);
// };

const otherfunction = mine => {
  console.log(mine + " is ok");
};

const pubsub = new Pubsub();
// store.watch("mydata", something);
// store.watch("mydata", otherfunction);
// store.unsubscribe("mydata", something);
// console.log(store.getState())
// store.commit({mydata:"hello"})
// console.log(store.getState())
const nameHandler = name => {
  return { ...store.getState(), ...{ mydata: name } };
};

const dataHandler = async () => {
  const url = "https://itunes.apple.com/search?term=";
  let value = "ss";
  return await fetch(`${url + value}&media=music&entity=song`)
    .then(res => res.json())
    .then(tunes => tunes)
    .catch(err => console.log(err));
};

dataHandler().then(data => {
  store.commit({ results: data.results });
});

class otherComp extends Component {
  constructor(props) {
    super(props);
    this.something = this.something.bind(this);
    const id = store.watch("state change", this.render.bind(this));
  }
  something(mydata) {
    console.log(mydata);
  }
  render() {
    // console.log(store.getState());
    // console.log(this.props.data);

    store.getState()["results"]
      ? (document.getElementById("root").innerHTML =
      store.getState()["results"].map(res=>`<p>${res.artistName}</p>`).join(''))
      : (document.getElementById("root").innerHTML = "nothing");
    // this.something(store.getState());
  }
}

class myComp extends Component {
  constructor(props) {
    super(props);
    this.something = this.something.bind(this);
    const id = store.watch("state change", this.render.bind(this));
  }
  something(mydata) {
    console.log(mydata);
    return mydata;
  }

  render() {
    // store.unsubscribe("state change", this.render.bind(this));
    // this.something(store.getState());
    store.getState()["results"]
    ? (document.getElementById("root").innerHTML =
    store.getState().results.map(res=>`<p>${res.artistName}</p>`).join(''))
    : (document.getElementById("root").innerHTML = "nothing");

  }
}

// const comp = new myComp({ isChild: false });

// store.emit('mydata',()=>nameHandler("hello"));
// store.emit('mydata',()=>nameHandler("hellosss"));
// store.emit('mydata',()=>nameHandler("hellowr4"));
// store.emit('mydata',()=>nameHandler("hello23423"));

// comp.render();
const comp2 = new otherComp({ isChild: false, data: store.getState() });
comp2.render();

