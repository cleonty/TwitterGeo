
package instagramclient

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

type InstagramClient struct {
	clientId     string
	clientSecret string
	accessToken  string
}

func New(clientId, clientSecret string) *InstagramClient {
	return &InstagramClient{clientId, clientSecret, ""}
}

func NewWithAccessToken(clientId, clientSecret string, accessToken string) *InstagramClient {
	return &InstagramClient{clientId, clientSecret, accessToken}
}

func (instagramClient *InstagramClient) Search(lat string, lng string, distance string) (body1 string, err error) {
	req, err := http.NewRequest("GET", "https://api.instagram.com/v1/media/search", nil)
	if err != nil {
		return "", err
	}
	q := req.URL.Query()
	q.Add("lat", lat)
	q.Add("lng", lng)
	q.Add("distance", distance)
	q.Add("access_token", instagramClient.accessToken)
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

func (instagramClient *InstagramClient) SearchHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := r.ParseForm(); err != nil {
			fmt.Println(err)
			return
		}
		lat := r.Form.Get("lat")
		lng := r.Form.Get("lng")
		distance := r.Form.Get("distance")
		access_token := r.Form.Get("access_token")
		fmt.Println("Instagram search for", lat, lng, distance, access_token)
		response, err := instagramClient.Search(lat, lng, distance)
		if err != nil {
			fmt.Println(err)
			return
		}
		w.Write([]byte(response))
	})
}
