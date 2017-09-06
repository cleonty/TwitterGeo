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
	Token_type   string
	Access_token string
}

type TwitterClient struct {
	apiKey      string
	apiSecret   string
	bearerToken string
}

func New(apiKey, apiSecret string) *TwitterClient {
	return &TwitterClient{apiKey, apiSecret, ""}
}

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
	twitterClient.bearerToken = res.Access_token
	return nil
}

func (twitterClient *TwitterClient) Search(query string) (body1 string, err error) {
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
