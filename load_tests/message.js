import http from 'k6/http';
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

export const options = {
    duration: "10s",
    vus: 10,
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'p(99.99)', 'count'],
}

export default function () {
    const url = 'http://localhost:7777/message'
    const payload = JSON.stringify({
        message: 'hello world',
        user: uuidv4()
    })

    http.post(url, payload);
}
