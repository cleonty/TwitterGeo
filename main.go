// TwitterGeo project main.go
package main

import (
	"fmt"
	"net/http"
	"os/exec"
)

func installTwitterClient(mux *http.ServeMux, pattern string) {
	apiKey := "PFVTXEm6eHZ4efqGOKyIoJM2H"
	apiSecret := "Gy9VNHY1VKFnKcVyl8lBQXjtXXbAcZKAL09TXVCJJVU8xuO3u1"
	twitterClient := NewTwitterClient(apiKey, apiSecret)
	err := twitterClient.ObtainBearerToken()
	if err != nil {
		fmt.Println("error", err)
		return
	}
	mux.Handle(pattern, twitterClient.SearchHandler())
}

func installInstagramClient(mux *http.ServeMux, pattern string) {
	clientId := "72cdc1f90de845f3ac377f72aa22d266"
	clientSecret := ""
	accessToken := "1540244705.72cdc1f.e9cde10469b64164bbab22aedd6b92e1"
	instagramClient := NewInstagramClientWithAccessToken(clientId, clientSecret, accessToken)
	mux.Handle(pattern, instagramClient.SearchHandler())
}

func main() {
	myMux := http.NewServeMux()
	installTwitterClient(myMux, "/twitter/search/")
	installInstagramClient(myMux, "/instagram/search/")
	myMux.Handle("/", http.FileServer(assetFS()))
	err := exec.Command("cmd", "/c", "start", "http://localhost:8383/").Start()
	if err != nil {
		fmt.Println(err)
		return
	}
	http.ListenAndServe(":8383", myMux)
}
