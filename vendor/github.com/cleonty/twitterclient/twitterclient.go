// Package twitterclient privides TwitterClient that helps to search for tweets
package twitterclient

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
)

type authResponse struct {
	TokenType   string `json:"token_type"`
	AccessToken string `json:"access_token"`
}

// TwitterClient is a simple Twitter client
type TwitterClient struct {
	apiKey      string
	apiSecret   string
	bearerToken string
}

// New creates a new client.
// apitKey and apiSecret are credentials that are
// utilized for Application-only authentication.
func New(apiKey, apiSecret string) *TwitterClient {
	return &TwitterClient{apiKey, apiSecret, ""}
}

// ObtainBearerToken makes an auth request with credeintials
// and exchange these credentials for a bearer token.
func (twitterClient *TwitterClient) ObtainBearerToken() error {
	data := url.Values{}
	data.Set("grant_type", "client_credentials")
	req, err := http.NewRequest("POST", "https://api.twitter.com/oauth2/token", bytes.NewBufferString(data.Encode()))
	if err != nil {
		return err
	}
	req.SetBasicAuth(twitterClient.apiKey, twitterClient.apiSecret)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
	req.Header.Add("Content-Length", strconv.Itoa(len(data.Encode())))
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	res := authResponse{}
	err = json.Unmarshal(body, &res)
	if err != nil {
		return err
	}
	twitterClient.bearerToken = res.AccessToken
	return nil
}

// Search returns latests Tweets that match the query
func (twitterClient *TwitterClient) Search(query string) (resultBody string, err error) {
	req, err := http.NewRequest("GET", "https://api.twitter.com/1.1/search/tweets.json", nil)
	if err != nil {
		return "", err
	}
	req.Header.Add("Authorization", "Bearer "+twitterClient.bearerToken)
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

// SearchHandler implements http.Handler
func (twitterClient *TwitterClient) SearchHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := r.ParseForm(); err != nil {
			fmt.Println(err)
			return
		}
		q := r.Form.Get("q")
		fmt.Println("searching  for", q)
		response, err := twitterClient.Search(q)
		if err != nil {
			fmt.Println(err)
			return
		}
		w.Write([]byte(response))
	})
}
