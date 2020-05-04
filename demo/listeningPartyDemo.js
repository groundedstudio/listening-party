// listeningPartyDemo.js
function formatHoursOrMins (num) {
    if (num < 10) {
        return("0" + num);
    } else {
        return(num);
    }
}

// Set the date we're counting down to
var countDownDate = new Date("May 4, 2020 19:00:00");
document.querySelector('#playAtTime').innerHTML = formatHoursOrMins(countDownDate.getHours()) + ":" + formatHoursOrMins(countDownDate.getMinutes());

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
        document.querySelector("#countdown").innerHTML = Math.floor(distance / 1000);
    }
}, 1000);
