// callback.js

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const session = urlParams.get('state');

if (session != null) {
    window.location.replace(("https://listening-party.com/" + session + queryString))
} else {
    document.getElementById('info').innerHTML = "Something went wrong :("
}
