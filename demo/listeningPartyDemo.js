// listeningPartyDemo.js

// If the current time is before half past the hour, the start time is the hour
// just passed. If the current time is after half past the hour, the start time
// is on the coming hour.
// Set the date we're counting down to
var countDownDate = new Date();
if (countDownDate.getMinutes() < 30) {
    countDownDate.setSeconds(0);
    countDownDate.setMinutes(0);
} else {
    countDownDate.setSeconds(0);
    countDownDate.setMinutes(0);
    countDownDate.setHours((countDownDate.getHours() + 1));
};

// Set the tracklist/timings.
const tracklist = [
    [0, "Headache"],
    [183, "Pull Up (feat. Bowzer Boss)"],
    [366, "Knock Door Run"],
    [544, "Moscow (feat. Bowzer Boss)"],
    [743, "Every Country (feat. Murkage Dave)"],
    [1021, "Let Me Go (feat. TiGA & YASeeN RosaY)"],
    [1259, "Anymore (feat. S-X)"],
    [1455, "Toothache"],
    [1620, "END"]
];
const tracklistURIs = ['spotify:track:2hLuNmDwpl04WVyFXhQePA', 'spotify:track:1yPujwhLo1TmyRGh5BVivY', 'spotify:track:7GtbccqbIm5w3hIlgPafxr', 'spotify:track:1sdYeOmSJymoav7ZQ7cXZO', 'spotify:track:3UrExtBIW2ZXNUIzmlCuvz', 'spotify:track:5HFPM9uTdfoEnvygUmZiU1', 'spotify:track:1yGnoWeatZTiCuS4xbiGy5', 'spotify:track:2ljuwHtdINTHKX4Mz5ujzw'];

// Countdown text stuff.
function formatHoursOrMins (num) {
    if (num < 10) {
        return("0" + num);
    } else {
        return(num);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('#playAtTime').innerHTML = formatHoursOrMins(countDownDate.getHours()) + ":" + formatHoursOrMins(countDownDate.getMinutes());

    // Countdown in header bar.
    // Update the count down every 1 second
    var x = setInterval(function() {

        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate.getTime() - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        if (distance > 0) {
            document.querySelector("#countdown").innerHTML = days + "d " + hours + "h "
            + minutes + "m " + seconds + "s ";
        }

        // If the count down is finished, write some text
        if ((distance/1000) < -(tracklist[(tracklist.length - 1)][0])) {
            clearInterval(x);
            document.querySelector("#countdown").innerHTML = "The listening party has ended!";
        } else if (distance < 0) {
            document.querySelector("#countdown").innerHTML = "The listening party has started!";
            // Set 'playAt' in media bar to show how far throught the party is.
            var seekTo = howFarThroughTracklist(tracklist, Math.abs((distance/1000)));
            var playAt = document.querySelector("#playAt");
            playAt.innerHTML = `${tracklist[seekTo[0]][1]} - ${Math.floor(((seekTo[1] * 1000) % (1000 * 60 * 60)) / (1000 * 60))}:${Math.floor(((seekTo[1] * 1000) % (1000 * 60)) / 1000)}`;
            playAt.style.padding = "0 17.5px 0 17.5px";
        };
    }, 1000);

    // Determine if the Spotify Web SDK should be loaded.
    const queryString = window.location.hash;
    const urlParams = new URLSearchParams(('?' + queryString.substring(1)));
    // Check that there is an access token provided.
    if (urlParams.get('access_token') != null) {
        // Add the Spotify SDK script tag to the DOM.
        var spotifySDK = document.createElement('script');
        spotifySDK.setAttribute('src','https://sdk.scdn.co/spotify-player.js');
        document.head.appendChild(spotifySDK);

        // Swap the 'connect spotify' and 'play @' buttons for a
        // 'spotify will play in...' text.
        document.getElementById('playAt').style.display = "none";
        document.getElementById('connectWithSpotify').style.display = "none";

        // When playback SDK is ready, generate player with user's access_token.
        window.onSpotifyWebPlaybackSDKReady = () => {
            const token = urlParams.get('access_token');
            const player = new Spotify.Player({
                name: 'Listening Party',
                getOAuthToken: cb => { cb(token); }
            });

            // Error handling
            player.addListener('initialization_error', ({ message }) => { console.error(message); });
            player.addListener('authentication_error', ({ message }) => { console.error(message); });
            player.addListener('account_error', ({ message }) => { console.error(message); });
            player.addListener('playback_error', ({ message }) => { console.error(message); });

            // Playback status updates
            player.addListener('player_state_changed', state => { console.log(state); });

            // Ready
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                // Let the user know that spotify will play when the party starts.
                document.getElementById('spotifyWillPlayIn').style.display = "inline";
            });

            // Not Ready
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            // Connect to the player!
            player.connect();

            const play = ({
                spotify_uri,
                playerInstance: {
                    _options: {
                        getOAuthToken,
                        id
                    }
                }
            }) => {
                getOAuthToken(access_token => {
                    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ uris: spotify_uri }),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${access_token}`
                        },
                    });
                });
            };

            // Countdown to Spotify Play.
            // Update the count down every 1 second
            var playing = false;
            var y = setInterval(function() {

                // Get today's date and time
                var now = new Date().getTime();

                // Find the distance between now and the count down date
                var distance = countDownDate.getTime() - now;

                // If the count down is finished, and the user is within 2 seconds
                // of the party start time, and the resource has not started
                // playing yet, clear the countdown and play the resource.
                if ((distance < 0) && ((distance/1000) > -2) && !playing) {
                    playing = true;
                    play({
                        playerInstance: player,
                        spotify_uri: tracklistURIs,
                    });
                // If the count down has finished and the user is after the time that
                // the party is due to finish, tell them.
                } else if ((distance/1000) < -(tracklist[(tracklist.length - 1)][0])) {
                    clearInterval(y);
                    var spotWillPlayIn = document.getElementById('spotifyWillPlayIn')
                    spotWillPlayIn.innerHTML = "The party has ended!";
                // If the count down has finished and the user has joined during the
                // party session, and the resouce has not started playing yet,
                // seek/skip them to the right place.
                } else if ((distance < 0) && ((distance/1000) > -(tracklist[(tracklist.length - 1)][0])) && !playing) {
                    console.log("Skip/Seeking to correct position.");
                    // Generate a the list of remaining songs.
                    var seekTo = howFarThroughTracklist(tracklist, Math.abs((distance/1000)));
                    var uri_array = tracklistURIs.splice(seekTo[0]);
                    playing = true;
                    play({
                        playerInstance: player,
                        spotify_uri: uri_array,
                    });
                    setTimeout(() => { player.seek(((seekTo[1] * 1000) -1000)); }, 1000);
                };
            }, 1000);
        };
    };
})

// function to find how far through which song in a tracklist a given number
// of seconds is.
// returns an array of [tracklist_index, seconds_through_song], or null if
// resource has finished.
function howFarThroughTracklist(tracklist, noOfSeconds) {
    var index;
    var seekSecs;
    // If resource has finished.
    if (noOfSeconds >= (tracklist[tracklist.length - 1][0])) {
        return(null);
    };

    for (var i=0; i<tracklist.length; i++) {
        // If playing track is current track value.
        if (noOfSeconds < (tracklist[i+1][0])) {
            index = i;
            seekSecs = (noOfSeconds - tracklist[i][0]);
            return([index, seekSecs]);
        }
    }
};
