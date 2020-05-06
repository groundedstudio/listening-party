// listeningPartyDemo.js

// Set the date we're counting down to
var countDownDate = new Date("May 6, 2020 16:00:00");

// Set the tracklist/timings.
const tracklist = [{0: "Intro"}, {663: "Track 2"}, {723: "End"}];

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

        document.querySelector("#countdown").innerHTML = days + "d " + hours + "h "
        + minutes + "m " + seconds + "s ";

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
            document.querySelector("#countdown").innerHTML = "The listening party has started!";
        } else if (distance < (Object.keys(tracklist)[Object.keys(tracklist).length - 1])) {
            clearInterval(x);
            document.querySelector("#countdown").innerHTML = "The listening party has ended!";
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
                        body: JSON.stringify({ context_uri: spotify_uri }),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${access_token}`
                        },
                    });
                });
            };

            // Countdown to Spotify Play.
            // Update the count down every 1 second
            var y = setInterval(function() {

                // Get today's date and time
                var now = new Date().getTime();

                // Find the distance between now and the count down date
                var distance = countDownDate.getTime() - now;

                // If the count down is finished, and the user is within 2 seconds
                // of the party start time, clear the countdown and play the resource.
                if ((distance < 0) && (distance > -2)) {
                    clearInterval(y);
                    play({
                        playerInstance: player,
                        spotify_uri: 'spotify:album:1fsaYVjt3lRC0jIL9YuEne',
                    });
                // If the count down has finished and the user is after the time that
                // the part is due to finish, tell them.
                } else if (distance < (Object.keys(tracklist)[Object.keys(tracklist).length - 1])) {
                    clearInterval(y);
                    var spotWillPlayIn = document.getElementById('spotifyWillPlayIn')
                    spotWillPlayIn.innerHTML = "The party has ended!";
                // If the count down has finished and the user has joined during the
                // party session, seek/skip them to the right place.
                } else if ((distance < 0) && (distance > (Object.keys(tracklist)[Object.keys(tracklist).length - 1]))) {
                    console.log("Skip to correct position");
                };
            }, 1000);
        };
    };
})
