let accessToken;
const clientId = "a2ea1476dd414df687fb59231f13bc58";
const redirectUrl = "http://localhost:3000/";
const corsAnyWhereUrl = "https://cors-anywhere.herokuapp.com/";

function handleErrors(response) {
  if (!response.ok) {
    response.text().then(text => console.log(text));
    throw Error(response.statusText);
  }
  return response;
}

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }
    const url = window.location.href;
    const accessTokenMatch = url.match(/access_token=([^&]*)/);
    const expiresInMatch = url.match(/expires_in=([^&]*)/);
    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
      window.history.pushState("Access Token", null, "/");
      return accessToken;
    } else {
      const oauthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUrl}`;
      window.location = oauthUrl;
    }
  },

  search(term) {
    const accessToken = Spotify.getAccessToken();
    return fetch(
      corsAnyWhereUrl +
        `https://api.spotify.com/v1/search?type=track&q=${term}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
      .then(response => {
        return response.json();
      })
      .then(jsonResponse => {
        if (!jsonResponse.tracks) {
          return [];
        }
        return jsonResponse.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        }));
      });
  },

  savePlaylist(playlistName, uris) {
    if (!playlistName || !uris) {
      console.log(playlistName);
      console.log(uris);
      throw Error('playlistName or URIs is undefined.')
    }

    let accessToken = this.getAccessToken();
    const getHearders = {
      Authorization: `Bearer ${accessToken}`
    };
    const postHeaders = {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/jason',
      'Content-Type': 'application/json'
    };

    let userId;

    return fetch(corsAnyWhereUrl + "https://api.spotify.com/v1/me", {
      headers: getHearders
    })
      .then(handleErrors)
      .then(response => {
        return response.json();
      })
      .then(jsonResponse => {
        userId = jsonResponse.id;
        console.log(userId);
        return fetch(
          corsAnyWhereUrl +
            `https://api.spotify.com/v1/users/${userId}/playlists`,
          {
            method: "POST",
            headers: getHearders,
            body: JSON.stringify({
              name: playlistName
            })
          }
        )
          .then(handleErrors)
          .then(response => {
            return response.json();
          })
          .then(jsonResponse => {
            const playlistId = jsonResponse.id;
            console.log(JSON.stringify(uris));
            return fetch(
              corsAnyWhereUrl +
              `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
              {
                method: "POST",
                headers: postHeaders,
                body:JSON.stringify({uris: uris})
              }
            ).then(handleErrors);
          });

      });
  }
};

export default Spotify;
