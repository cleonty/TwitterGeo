// TwitterClient_test.go
package main

import (
	"testing"
)

func TestTwitterClient(t *testing.T) {
	apiKey := "PFVTXEm6eHZ4efqGOKyIoJM2H"
	apiSecret := "Gy9VNHY1VKFnKcVyl8lBQXjtXXbAcZKAL09TXVCJJVU8xuO3u1"
	twitterClient := NewTwitterClient(apiKey, apiSecret)
	err := twitterClient.ObtainBearerToken()
	if err != nil {
		t.Fatal("Authentication failed", err)
	}
	tweets, err := twitterClient.Search("geocode:56.833330,60.583330,1km")
	if err != nil {
		t.Fatal("Couldn't get tweets", err)
	}
	if len(tweets) == 0 {
		t.Fatal("No tweets")
	}

}
