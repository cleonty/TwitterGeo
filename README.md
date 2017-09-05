[![Build Status](https://travis-ci.org/cleonty/TwitterGeo.svg?branch=master)](https://travis-ci.org/cleonty/TwitterGeo)
[![codecov](https://codecov.io/gh/cleonty/TwitterGeo/branch/master/graph/badge.svg)](https://codecov.io/gh/cleonty/TwitterGeo)

# TwitterGeo
TwitterGeo shows tweets on the map.

# Building a docker image
```
docker build -t twittergeox .
docker tag twittergeox cleonty/twittergeo:first
docker push cleonty/twittergeo:first
```
# Running a docker container
```
docker run -p 8888:8383 cleonty/twittergeo:first 
```
Open [http://localhost:8888] in the browser.
