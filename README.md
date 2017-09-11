[![Build Status](https://travis-ci.org/cleonty/twittergeo.svg?branch=master)](https://travis-ci.org/cleonty/TwitterGeo)
[![codecov](https://codecov.io/gh/cleonty/twittergeo/branch/master/graph/badge.svg)](https://codecov.io/gh/cleonty/twittergeo)

# TwitterGeo
TwitterGeo shows tweets on the map.

## Installation and usage

To install, run:

```
go get github.com/cleonty/twittergeo
```
To run using a docker image, run:
```
docker run -p 8888:8383 cleonty/twittergeo:latest
```
Open <http://localhost:8888> in the browser.

## Building a docker image

```
docker build -t twittergeo .
docker tag twittergeo cleonty/twittergeo:latest
docker push cleonty/twittergeo:latest
```
