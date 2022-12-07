import ws from 'k6/ws';
import http from 'k6/http';
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import { randomString, randomIntBetween  } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';


/**
 *  K6 test for sending comment
 *  In order to make this comment test work, I took some expectations:
 *  The commented message can be seen after sending the comment.
 *  The actual test has two phases: one for creating the message to be commented and one for sending all the messages.
 *  Individual comment tests ends when either posted comment is found in the message or 3 seconds have passed.
 *  (If no 3s timecap, then the connection and the k6 will take 10 minute to finish)
 */


export const options = {
    vus: 2,
    duration: '10s'
};

// Setup phase for the test.
// Creates a new message where the comments of the real test are added.
export function setup() {
    const url = 'ws://localhost:7777/connect';
    const user = uuidv4()
    let id = 0;
    ws.connect(url, null, function (socket) {
        socket.on('open', function open() {
            socket.setTimeout(function () {
                const payload = JSON.stringify({
                    message: randomString(5),
                    user: user,
                })
                const http_url = 'http://localhost:7777/message'
                http.post(http_url, payload);
            }, 100);
        });

        socket.on('close', function () {

        });

        socket.on('message', function (message) {
            const msg = JSON.parse(message);
            const users = msg.map(row => row.username)


            // If we find own message --> update the id
            if (users.includes(user)) {
                id = msg[0].id;
            }
        });


        // Wait for some time before closing, so we can be sure that id of message is saved
        socket.setTimeout(function () {
            console.log(`Closing the setup connection`);
            socket.close();
        }, 3000);
    });

    return id;
}

// The actual test.
// Adds comments to the message created in the setup phase
// The data is send as http but the actual data retrieved from the backend is from WebSockets.
export default function (id) {
    const url = 'ws://localhost:7777/connect';
    const user = uuidv4()

    try {
        ws.connect(url, null, function (socket) {

            // On open send the comment
            socket.on('open', function open() {

                const payload = JSON.stringify({
                    comment: randomString(5),
                    user: user,
                    id: id
                })
                const http_url = 'http://localhost:7777/comment'
                http.post(http_url, payload);
            });

            socket.on('close', function () {

            });

            socket.on('error', function (e) {
                if(e.error() != 'websocket: close sent') {
                    console.log('An unexpected error occured: ', e.error());
                }
            })

            socket.on('message', function (message) {
                const msg = JSON.parse(message);
                const users = msg[0].comments.map(row => row.username)


                // If we find own comment --> close the connection
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