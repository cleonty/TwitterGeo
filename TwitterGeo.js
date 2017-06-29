function TwitterGeo(mapId, homeButtonId) {
  this.mapId = mapId;
  this.homeButtonId = homeButtonId;
  this.tweets = [];
  this.markers = [];
  this.geoOptions = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000
  };
  this.map = this.createMap();
  this.addHomeButtonOnClickListener();
  this.goToCurrentPosition();
  this.watchMapPosition();
}

TwitterGeo.prototype.createMap = function () {
  var square1905 = {lat: 56.833330, lng: 60.583330};
  var map = new google.maps.Map(document.getElementById(this.mapId), {
    zoom: 15,
    center: square1905,
    mapTypeId: 'hybrid'
  });
  return map;
};

TwitterGeo.prototype.removeMarkers = function () {
  for (var i = 0; i < this.markers.length; i++) {
    this.markers[i].setMap(null);
  }
  this.markers = [];
};

TwitterGeo.prototype.addMarker = function (tweet) {
  var twitterGeo = this;
  var marker = new google.maps.Marker({
    position: {
      lat: tweet.geo.coordinates[0],
      lng: tweet.geo.coordinates[1]
    },
    map: this.map,
    title: tweet.text
  });
  var linkStart = tweet.text.lastIndexOf("https://");
  var text;
  var profileImageUrl = tweet.user.profile_image_url_https;
  if (linkStart >= 0) {
    var textFragment = tweet.text.substr(0, linkStart);
    var linkFragment = tweet.text.substr(linkStart);
    text = `<a target="_blank" href='${linkFragment}'>${tweet.user.screen_name}: ${textFragment}</a>`;
  } else {
    text = tweet.user.screen_name + ': ' + tweet.text;
    console.log('Not found URL in tweet', text);
  }
  var textWithImage = `<img class='user_image' src='${profileImageUrl}'></img>${text}`;
  var infoWindow = new google.maps.InfoWindow({
    content: textWithImage,
    maxWidth: 250
  });
  marker.addListener('click', function () {
    infoWindow.open(twitterGeo.map, marker);
  });
  infoWindow.open(this.map, marker);
  this.markers.push(marker);
  return marker;
};

TwitterGeo.prototype.addMarkers = function (tweets) {
  for (var i = 0; i < tweets.length; i++) {
    if (tweets[i].geo) {
      var marker = this.addMarker(tweets[i]);
    } else {
      console.log('No geo information in tweet', tweets[i]);
    }
  }
};

TwitterGeo.prototype.reloadTweets = function (latitude, longitude) {
  var twitterGeo = this;
  var searchUri = encodeURI(`/search/?q=geocode:${latitude},${longitude},1km`);
  var searchRequest = new XMLHttpRequest();
  searchRequest.open('GET', searchUri, true);
  searchRequest.onload = function (e) {
    var jsonResponse = JSON.parse(searchRequest.responseText);
    var tweets = jsonResponse.statuses;
    twitterGeo.removeMarkers();
    twitterGeo.addMarkers(tweets);
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
