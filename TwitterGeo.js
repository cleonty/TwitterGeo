function TwitterGeo(mapId, homeButtonId, listId) {
  this.mapId = mapId;
  this.homeButtonId = homeButtonId;
  this.listId = listId;
  this.list = document.getElementById(listId);
  this.tweets = [];
  this.markers = [];
  this.currentInfoWindow = null;
  this.currentMarker = null;
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
  var profileImageUrl = tweet.user.profile_image_url_https;
  var formattedText;
  if (linkStart >= 0) {
    var textFragment = tweet.text.substr(0, linkStart);
    var linkFragment = tweet.text.substr(linkStart);
    formattedText = `${textFragment} <a target="_blank" href="${linkFragment}">${linkFragment}</a>`;
  } else {
    console.log('Not found URL in tweet', tweet.text);
    formattedText = tweet.text;
  }
  var content = [
    `<div class="media">`,
    `  <div class="media-left">`,
    `     <img src="${profileImageUrl}" class="media-object" style="width:48px">`,
    `  </div>`,
    `  <div class="media-body">`,
    `    <h4 class="media-heading">${tweet.user.name}</h4>`,
    `    <p>${formattedText}</p>`,
    `  </div>`,
    `</div>`
  ].join('\n');
  var infoWindow = new google.maps.InfoWindow({
    content: content,
    maxWidth: 320
  });
  marker.addListener('click', function () {
    twitterGeo.openInfoWindow(infoWindow, marker);
  });
  this.addTweetToList(tweet, marker, infoWindow, content);
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

TwitterGeo.prototype.openInfoWindow = function(infoWindow, marker) {
  if (this.currentInfoWindow) {
    this.currentInfoWindow.close();
    this.currentInfoWindow = null;
    this.currentMarker = null;
  }
  infoWindow.open(this.map, marker);
  this.currentInfoWindow = infoWindow;
  this.currentMarker = marker;
};

TwitterGeo.prototype.clearList = function () {
  var list = this.list;
  if (list) {
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
  }
};

TwitterGeo.prototype.addTweetToList = function (tweet, marker, infoWindow, textWithImage) {
  var twitterGeo = this;
  var list = this.list;
  if (list) {
    var li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = textWithImage;
    li.addEventListener('click', function (e) {
      twitterGeo.openInfoWindow(infoWindow, marker);
    });
    list.appendChild(li);
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
    twitterGeo.clearList();
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
