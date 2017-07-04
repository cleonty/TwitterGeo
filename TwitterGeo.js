/* global google */

function Tweet(tweetObject, map, list) {
  this.tweetObject = tweetObject;
  this.map = map;
  this.infoWindow;
  this.list = list;
  this.htmlContent = this.getHtmlContent();
  this.marker = this.createMarker();
  this.infoWindow = this.createInfoWindow();
  this.listItem = this.createListItem();
  this.onActivateListeners = [];
}

Tweet.prototype.getHtmlContent = function () {
  var linkStart = this.tweetObject.text.lastIndexOf("https://");
  var profileImageUrl = this.tweetObject.user.profile_image_url_https;
  var formattedText;
  if (linkStart >= 0) {
    var textFragment = this.tweetObject.text.substr(0, linkStart);
    var linkFragment = this.tweetObject.text.substr(linkStart);
    formattedText = `${textFragment} <a target="_blank" href="${linkFragment}">${linkFragment}</a>`;
  } else {
    console.log('Not found URL in tweet', this.tweetObject.text);
    formattedText = this.tweetObject.text;
  }
  return [
    `<div class="media">`,
    `  <div class="media-left">`,
    `     <img src="${profileImageUrl}" class="media-object" style="width:48px">`,
    `  </div>`,
    `  <div class="media-body">`,
    `    <h4 class="media-heading">${this.tweetObject.user.name}</h4>`,
    `    <p>${formattedText}</p>`,
    `  </div>`,
    `</div>`
  ].join('\n');
};

Tweet.prototype.createMarker = function () {
  var marker = new google.maps.Marker({
    position: {
      lat: this.tweetObject.geo.coordinates[0],
      lng: this.tweetObject.geo.coordinates[1]
    },
    map: this.map,
    title: this.tweetObject.text
  });
  marker.addListener('click', this.activate.bind(this));
  return marker;
};

Tweet.prototype.createInfoWindow = function () {
  var infoWindow = new google.maps.InfoWindow({
    content: this.htmlContent,
    maxWidth: 320
  });
  return infoWindow;
};

Tweet.prototype.createListItem = function () {
  var li = document.createElement('li');
  li.className = 'list-group-item';
  li.innerHTML = this.htmlContent;
  li.addEventListener('click', this.activate.bind(this), false);
  this.list.appendChild(li);
  return li;
};

Tweet.prototype.openInfoWindow = function () {
  this.infoWindow.open(this.map, this.marker);
};

Tweet.prototype.closeInfoWindow = function () {
  this.infoWindow.close();
};

Tweet.prototype.activate = function () {
  if (!this.active) {
    this.openInfoWindow();
    this.listItem.scrollIntoViewIfNeeded({
      behavior: "smooth",
      block: "start"
    });
    this.listItem.classList.add('list-group-item-info');
    this.active = true;
    this.notifyOnActivateListeners();
  }
};

Tweet.prototype.deactivate = function () {
  if (this.active) {
    this.infoWindow.close();
    this.listItem.classList.remove('list-group-item-info');
    this.active = false;
  }
};

Tweet.prototype.notifyOnActivateListeners = function () {
  for (var i = 0; i < this.onActivateListeners.length; i++) {
    this.onActivateListeners[i].call(null, this);
  }
};

Tweet.prototype.addOnActivateListener = function (handler) {
  if (typeof handler === 'function') {
    this.onActivateListeners.push(handler);
  }
};

Tweet.prototype.destroy = function () {
  this.marker.setMap(null);
};

function TweetList(map, list) {
  this.map = map;
  this.list = list;
  this.tweets = [];
  this.activeTweet = null;
  this.addEventListenters();
}

TweetList.prototype.setTweets = function (tweetObjects) {
  this.clear();
  for (var i = 0; i < tweetObjects.length; i++) {
    this.addTweet(tweetObjects[i]);
  }
};

TweetList.prototype.addTweet = function (tweetObject) {
  if (tweetObject.geo) {
    var tweet = new Tweet(tweetObject, this.map, this.list);
    this.tweets.push(tweet);
    tweet.addOnActivateListener(this.onTweetActivated.bind(this));
  } else {
    console.log('No geo info in tweet', tweetObject);
  }
};

TweetList.prototype.clear = function () {
  for (var i = 0; i < this.tweets.length; i++) {
    this.tweets[i].destroy();
  }
  this.tweets = [];
  this.activeTweet = null;
  while (this.list.firstChild) {
    this.list.removeChild(this.list.firstChild);
  }
};

TweetList.prototype.onTweetActivated = function (tweet) {
  if (this.activeTweet !== tweet) {
    var tweets = this.tweets;
    for (var i = 0; i < tweets.length; i++) {
      if (tweets[i] !== tweet) {
        tweets[i].deactivate();
      }
    }
    this.activeTweet = tweet;
  }
};

TweetList.prototype.activateNextTweet = function () {
  if (this.activeTweet) {
    var nextTweetIndex = this.tweets.indexOf(this.activeTweet) + 1;
    if (this.tweets[nextTweetIndex]) {
      this.tweets[nextTweetIndex].activate();
    } else {
      this.tweets[0].activate();
    }
  } else if (this.tweets.length > 0) {
    this.tweets[0].activate();
  }
};

TweetList.prototype.activatePreviousTweet = function () {
  if (this.activeTweet) {
    var nextTweetIndex = this.tweets.indexOf(this.activeTweet) - 1;
    if (this.tweets[nextTweetIndex]) {
      this.tweets[nextTweetIndex].activate();
    } else {
      this.tweets[this.tweets.length - 1].activate();
    }
  } else if (this.tweets.length > 0) {
    this.tweets[0].activate();
  }
};

TweetList.prototype.onKeyPressed = function (e) {
  if (e.code === 'ArrowUp') {
    e.preventDefault();
    e.stopPropagation();
    this.activatePreviousTweet();
  } else if (e.code === 'ArrowDown') {
    e.preventDefault();
    e.stopPropagation();
    this.activateNextTweet();
  }
};

TweetList.prototype.onWheel = function (e) {
  if (e.wheelDelta > 0) {
    e.preventDefault();
    e.stopPropagation();
    this.activatePreviousTweet();
  } else {
    e.preventDefault();
    e.stopPropagation();
    this.activateNextTweet();
  }
};

TweetList.prototype.addEventListenters = function () {
  document.addEventListener('keydown', this.onKeyPressed.bind(this));
  document.addEventListener('wheel', this.onWheel.bind(this));
};

function TwitterGeo(mapId, homeButtonId, listId) {
  this.mapId = mapId;
  this.homeButtonId = homeButtonId;
  this.listId = listId;
  this.list = document.getElementById(listId);
  this.geoOptions = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000
  };
  this.map = this.createMap();
  this.tweetList = new TweetList(this.map, this.list);
  this.addHomeButtonOnClickListener();
  this.goToCurrentPosition();
  this.watchMapPosition();
}

TwitterGeo.prototype.createMap = function () {
  var square1905 = {lat: 56.833330, lng: 60.583330};
  var map = new google.maps.Map(document.getElementById(this.mapId), {
    zoom: 15,
    center: square1905,
    mapTypeId: 'hybrid',
    keyboardShortcuts: false
  });
  return map;
};

TwitterGeo.prototype.reloadTweets = function (latitude, longitude) {
  var twitterGeo = this;
  var searchUri = encodeURI(`/search/?q=geocode:${latitude},${longitude},1km`);
  var searchRequest = new XMLHttpRequest();
  searchRequest.open('GET', searchUri, true);
  searchRequest.onload = function (e) {
    var jsonResponse = JSON.parse(searchRequest.responseText);
    var tweets = jsonResponse.statuses;
    twitterGeo.tweetList.setTweets(tweets);
  };
  searchRequest.onerror = function (e) {
    console.log(e);
  };
  searchRequest.send();
};

TwitterGeo.prototype.geoSuccess = function (position) {
  console.log('New position:', position.coords.latitude, position.coords.longitude);
  this.map.setCenter({
    lat: position.coords.latitude,
    lng: position.coords.longitude
  });
  this.reloadTweets(position.coords.latitude, position.coords.longitude);
};

TwitterGeo.prototype.geoError = function () {
  alert("Sorry, no position available.");
};

TwitterGeo.prototype.watchPosition = function () {
  navigator.geolocation.watchPosition(this.geoSuccess.bind(this), this.geoError.bind(this), this.geoOptions);
};

TwitterGeo.prototype.watchMapPosition = function () {
  var twitterGeo = this;
  this.map.addListener('dragend', function () {
    var center = twitterGeo.map.getCenter();
    twitterGeo.reloadTweets(center.lat(), center.lng());
  });
};

TwitterGeo.prototype.goToCurrentPosition = function () {
  navigator.geolocation.getCurrentPosition(this.geoSuccess.bind(this), this.geoError.bind(this), this.geoOptions);
};

TwitterGeo.prototype.addHomeButtonOnClickListener = function () {
  var homeButton = document.getElementById(this.homeButtonId);
  if (homeButton) {
    homeButton.addEventListener('click', this.goToCurrentPosition.bind(this));
  }
};
