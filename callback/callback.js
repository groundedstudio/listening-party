// callback.js

const queryString = window.location.hash;
const urlParams = new URLSearchParams(('?' + queryString.substring(1)));
const session = urlParams.get('state');

if (session != null) {
    window.location.replace(("https://listening-party.com/" + session + queryString))
} else {
    document.getElementById('info').innerHTML = "Something went wrong :("
}
