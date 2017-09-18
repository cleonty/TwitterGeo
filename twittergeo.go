package main

import (
	"fmt"
	"net/http"
	"os/exec"
	"runtime"

	"github.com/cleonty/twitterclient"
)

func installTwitterClient(mux *http.ServeMux, pattern string) {
	apiKey := "PFVTXEm6eHZ4efqGOKyIoJM2H"
	apiSecret := "Gy9VNHY1VKFnKcVyl8lBQXjtXXbAcZKAL09TXVCJJVU8xuO3u1"
	twitterClient := twitterclient.New(apiKey, apiSecret)
	err := twitterClient.ObtainBearerToken()
	if err != nil {
		fmt.Println("error", err)
		return
	}
	mux.Handle(pattern, twitterClient.SearchHandler())
}

func main() {
	myMux := http.NewServeMux()
	installTwitterClient(myMux, "/twitter/search/")
	myMux.Handle("/", http.FileServer(assetFS()))
	if runtime.GOOS == "windows" {
		err := exec.Command("cmd", "/c", "start", "http://localhost:8383/").Start()
		if err != nil {
			fmt.Println(err)
			return
		}
	}
	http.ListenAndServe(":8383", myMux)
}
