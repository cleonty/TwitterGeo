// TwitterGeo project main.go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os/exec"
	"strconv"
)

var bearerToken string

type AuthResponse struct {
	Token_type   string
	Access_token string
}

func getBearerToken(apiKey, apiSecret string) (body1 string, err error) {
	data := url.Values{}
	data.Set("grant_type", "client_credentials")
	req, err := http.NewRequest("POST", "https://api.twitter.com/oauth2/token", bytes.NewBufferString(data.Encode()))
	if err != nil {
		return "", err
	}
	req.SetBasicAuth(apiKey, apiSecret)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
	req.Header.Add("Content-Length", strconv.Itoa(len(data.Encode())))
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	res := AuthResponse{}
	err = json.Unmarshal(body, &res)
	if err != nil {
		return "", err
	}
	return res.Access_token, nil
}

func search(token string, query string) (body1 string, err error) {
	req, err := http.NewRequest("GET", "https://api.twitter.com/1.1/search/tweets.json", nil)
	if err != nil {
		return "", err
	}
	req.Header.Add("Authorization", "Bearer "+token)
	q := req.URL.Query()
	q.Add("q", query)
	q.Add("result_type", "recent")
	q.Add("count", "30")
	req.URL.RawQuery = q.Encode()
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	return string(body), nil
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		fmt.Println(err)
		return
	}
	q := r.Form.Get("q")
	fmt.Println("searching  for", q)
	response, err := search(bearerToken, q)
	if err != nil {
		fmt.Println(err)
		return
	}
	w.Write([]byte(response))
}

func main() {
	apiKey := "PFVTXEm6eHZ4efqGOKyIoJM2H"
	apiSecret := "Gy9VNHY1VKFnKcVyl8lBQXjtXXbAcZKAL09TXVCJJVU8xuO3u1"

	token, err := getBearerToken(apiKey, apiSecret)
	if err != nil {
		fmt.Println("error", err)
		return
	}
	bearerToken = token
	fmt.Println("token:", bearerToken)
	tweets, err := search(bearerToken, "geocode:56.833330,60.583330,1km")
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(tweets)
	myMux := http.NewServeMux()

	myMux.HandleFunc("/search/", searchHandler)
	myMux.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("."))))
	err = exec.Command("cmd", "/c", "start", "http://localhost:8383/").Start()
	if err != nil {
		fmt.Println(err)
		return
	}
	http.ListenAndServe(":8383", myMux)
}
