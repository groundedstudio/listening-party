// listeningParty.js

// Set the date we're counting down to
var countDownDate = new Date('07 May 2020 13:00:00 UTC');

// Set the tracklist/timings.
const tracklist = [
    [0, "The 1975"],
    [84, "Love Me"],
    [306, "UGH!"],
    [486, "A Change Of Heart"],
    [770, "She's American"],
    [1040, "If I Believe You"],
    [1420, "Please Be Naked"],
    [1685, "LostmyHead"],
    [2005, "The Ballad Of Me And My Brain"],
    [2176, "Somebody Else"],
    [2524, "Loving Someone"],
    [2784, "I like it when you sleep, for you are so beautiful yet so unaware of it"],
    [3170, "The Sound"],
    [3419, "This Must Be My Dream"],
    [3671, "Paris"],
    [3964, "Nana"],
    [4202, "She Lays Down"],
    [4441, "END"]
];

const tracklistURIs = [
    'spotify:track:4LyEonRJ0clC020Yz3Qtk6',
    'spotify:track:2HklyUw3TR56nVyVJAIhw5',
    'spotify:track:2T4oNTmPYTZTdIzeFdNNez',
    'spotify:track:49clMzwHdKb5f0awEH99pg',
    'spotify:track:5aV4HUW9RFOB0aXq0Ud9s0',
    'spotify:track:1IwdvZ3djfD1SfhexKUmXk',
    'spotify:track:7jS5cQ5GuGkPPdIoUUct0P',
    'spotify:track:6VHMSHQksLkszxJcPrq8FW',
    'spotify:track:6h2Xr5MLLtsiqoAjR760QF',
    'spotify:track:4m0q0xQ2BNl9SCAGKyfiGZ',
    'spotify:track:5RD9TjTKGTTA61cBw7PImI',
    'spotify:track:7EQigqw8SToxlAXF2YMqjg',
    'spotify:track:7h6lpVuSGPW6RNjDXKpYDh',
    'spotify:track:42PHzFk7j5Jo2Rtj78JsWV',
    'spotify:track:6C88rHxXBlpcgtBY3HAF0E',
    'spotify:track:084LwoVbV9TMRUSZUIkPmV',
    'spotify:track:3Smx621pPslSi49Ff4bVPo'
];

// Countdown text stuff.
function formatHoursOrMins (num) {
    if (num < 10) {
        return("0" + num);
    } else {
        return(num);
    }
};

// Shorten a text string if it's longed than a given amount of characters.
function shortenString(string, length) {
    // Take the absolute of the value.
    const absLen = Math.abs(length);

    if (string.length > absLen) {
        return(`${string.slice(0, (length-3))}...`)
    } else {
        return(string);
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
            playAt.innerHTML = `${shortenString(tracklist[seekTo[0]][1], 25)} - ${formatHoursOrMins(Math.floor(((seekTo[1] * 1000) % (1000 * 60 * 60)) / (1000 * 60)))}:${formatHoursOrMins(Math.floor(((seekTo[1] * 1000) % (1000 * 60)) / 1000))}`;
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
                    document.querySelector("#playAt").style.display = "inline";
                    document.querySelector("#playAt").style.margin = "0px 17.5px 0px 17.5px";
                    document.querySelector("#spotifyWillPlayIn").style.display = "none";
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
                    setTimeout(() => { player.seek(((seekTo[1] * 1000) + 1000)); }, 1000);
                    document.querySelector("#playAt").style.display = "inline-flex";
                    document.querySelector("#playAt").style.margin = "0px auto 0px auto";
                    document.querySelector("#spotifyWillPlayIn").style.display = "none";
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
