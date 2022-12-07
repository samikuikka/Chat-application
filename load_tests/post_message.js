import ws from 'k6/ws';
import http from 'k6/http';
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';


/**
 *  K6 test for sending message.
 *  The test is only done to the backend, so the actual 
 *  WebSocket connection is done in k6.
 *  This test creates a new WebSocket connection to the backend, and sends
 *  a new message through http.
 *  Single test is finished when own message is retrieved throught he WebSocket connection
 *  or connection is older than 3 seconds (e.g., error retrieving the own message)
 */

export const options = {
  vus: 2,
  duration: '10s'
};


export default function () {
    const url = 'ws://localhost:7777/connect';
    const user = uuidv4()

    try { 
        ws.connect(url, null, function (socket) {
        socket.on('open', function open() {

            const payload = JSON.stringify({
                message: randomString(5),
                user: user,
            })
            const http_url = 'http://localhost:7777/message'
            http.post(http_url, payload);
        });

        socket.on('close', function () {
            
        });

        socket.on('message', function (message) {
            const msg = JSON.parse(message);
            const users = msg.map(row => row.username)


            // If we find own message --> close the connection
            if (users.includes(user)) {
                socket.close();
            }
        });


        // If something goes wrong in backend, close the connection after 3 seconds.
        socket.setTimeout(function () {
            console.log(`Closing the socket forcefully`);
            socket.close();
        }, 3000);
    });
} catch (e) {
   
}


}