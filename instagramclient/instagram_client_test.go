package instagramclient

import (
	"testing"
)

func TestInstagramClient(t *testing.T) {
	clientId := "72cdc1f90de845f3ac377f72aa22d266"
	clientSecret := ""
	accessToken := "1540244705.72cdc1f.e9cde10469b64164bbab22aedd6b92e1"
	instagramClient := NewWithAccessToken(clientId, clientSecret, accessToken)
	posts, err := instagramClient.Search("56.833330", "60.583330", "1km")
	if err != nil {
		t.Fatal("Couldn't get Instagram posts", err)
	}
	if len(posts) == 0 {
		t.Fatal("No posts")
	}
}

/*
https://www.instagram.com/oauth/authorize/?client_id=72cdc1f90de845f3ac377f72aa22d266&redirect_uri=http://localhost:8383/redirect_uri&response_type=code
https://www.instagram.com/oauth/authorize/?client_id=72cdc1f90de845f3ac377f72aa22d266&redirect_uri=http://localhost:8383/redirect_uri&response_type=token
https://www.instagram.com/oauth/authorize/?client_id=72cdc1f90de845f3ac377f72aa22d266&redirect_uri=http://localhost:8383/&scope=public_content&response_type=token
http://localhost:8383/redirect_uri#access_token=1540244705.72cdc1f.e9cde10469b64164bbab22aedd6b92e1
https://api.instagram.com/v1/media/search?lat=56.833330&lng=60.583330&access_token=1540244705.72cdc1f.e9cde10469b64164bbab22aedd6b92e1
https://api.instagram.com/v1/media/search?lat=56.833330&lng=60.583330&distance=5km&access_token=1540244705.72cdc1f.e9cde10469b64164bbab22aedd6b92e1
http://localhost:8383/instagram/search/?lat=56.842787730707684&lng=60.61732717399673&distance=5km&access_token=1540244705.72cdc1f.e9cde10469b64164bbab22aedd6b92e1
*/
