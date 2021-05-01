const axios = require('axios')


const iftttWebhookKey = 'bIAwzTXiiq_nfmCVUcNwYL' // Replace value here
const iftttWebhookName = 'vaccine-available' // Replace value here
const districtId = '565'; // Replace value here
const yourAge = 50  // Replace value here

const notificationUrl = `https://maker.ifttt.com/trigger/${iftttWebhookName}/with/key/${iftttWebhookKey}`;

const intervalInMs = 60000; // 15 mins interval (in milliseconds)
const appointmentsListLimit = 10 // Increase/Decrease it based on the amount of information you want in the notification.

function getDate() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const dd = tomorrow.getDate();
    const mm = tomorrow.getMonth() + 1;
    const yyyy = tomorrow.getFullYear();
    return `${dd < 10 ? '0' + dd : dd}-${mm < 10 ? '0' + mm : mm}-${yyyy}`
}
const date = getDate();

function pingCowin() {
    axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${date}`).then((result) => {
        const { centers } = result.data;
        let isSlotAvailable = false;
        let dataOfSlot = "";
        let appointmentsAvailableCount = 0;
        if (centers.length) {
            centers.forEach(center => {
                center.sessions.forEach((session => {
                    if (session.min_age_limit < +yourAge && session.available_capacity > 0) {
                        isSlotAvailable = true
                        appointmentsAvailableCount++;
                        if (appointmentsAvailableCount <= appointmentsListLimit) {
                            dataOfSlot = `${dataOfSlot}\nSlot for ${session.available_capacity} is available: ${center.name} on ${session.date}`;
                        }
                    }
                }))
            });

            dataOfSlot = `${dataOfSlot}\n${appointmentsAvailableCount - appointmentsListLimit} more slots available...`
        }
        if (isSlotAvailable) {
            axios.post(notificationUrl, { value1: dataOfSlot }).then(() => {
                console.log('Sent Notification to Phone ...')
                // clearInterval(timer);
            }).catch((error) => console.error(`Error occured while sending notifications Error:${error.message }`));
        }
    }).catch((err) => {
        console.log("Error: " + err.message);
    });
}

let pingCount = 0;
var timer = setInterval(() => {
    pingCount += 1;
    pingCowin();
    console.log("Ping Count - ", pingCount);
}, intervalInMs);



var http = require('http');
var fs = require('fs');
var path = require('path');

http.createServer(function (request, response) {

   console.log('request starting for ');
   console.log(request);

}).listen(process.env.PORT || 5000);

console.log('Server running at http://127.0.0.1:5000/');