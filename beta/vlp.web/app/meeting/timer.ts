
export default class Timer {
    initialize(endDateTime: string, beforeMeetingEndTime: number, callback: any) {
        //const currentTimezoneOffset = new Date().getTimezoneOffset();
        //const convertedEndDateTime = this.convertUTCDateTimeToUserSepcificDateTime(endDateTime, currentTimezoneOffset);

        // Set the date we're counting down to
        let countDownDate = new Date(endDateTime).getTime();

        // Update the count down every 1 second
        let interval = setInterval(async () => {
            // Get today's date and time
            var now;
            var xhr = new XMLHttpRequest() // create new XMLHttpRequest2 object
            xhr.open('GET', "https://worldtimeapi.org/api/timezone/ETC/UTC") // open GET request
            xhr.onload = async () => {
                if (xhr.status === 200) { // if Ajax request successful
                    var result = JSON.parse(xhr.responseText) // convert returned JSON string to JSON object
                    now = new Date(result.datetime);
                    now = now.getTime();
                    // Find the distance between now and the count down date
                    var difference = countDownDate - now;

                    // Time calculations for days, hours, minutes and seconds
                    var minutes = Math.floor(difference / 60000);
                    var seconds = ((difference % 60000) / 1000).toFixed(0);

                    // Display the result in the element with id="demo"
                    if (minutes < beforeMeetingEndTime) {
                        var x = document.getElementsByClassName("timer");
                        var i;
                        for (i = 0; i < x.length; i++) {
                            x[i].innerHTML = "Meeting Ends In : " + minutes + "M " + seconds + "S ";
                            (x[i] as HTMLButtonElement).style.display = "inline-block";
                        }
                    }

                    // If the count down is finished, write some text
                    if (difference < 0) {
                        var x = document.getElementsByClassName("timer");
                        var i;
                        for (i = 0; i < x.length; i++) {
                            x[i].innerHTML = "";
                            (x[i] as HTMLButtonElement).style.display = "none";
                        }
                        clearInterval(interval);
                        await callback();
                    }
                }
                else {
                    alert('Request failed.  Returned status of ' + xhr.status)
                }
            }
            xhr.send()

        }, 1000);
    }

    convertUTCDateTimeToUserSepcificDateTime(endDate: string, timeZoneOffset: number) {
        var targetTime = new Date(endDate);

        //get the timezone offset from local time in minutes
        var tzDifference = timeZoneOffset * 60 + targetTime.getTimezoneOffset();

        //convert the offset to milliseconds, add to targetTime, and make a new Date
        return new Date(targetTime.getTime() + tzDifference * 60 * 1000);
    }
}