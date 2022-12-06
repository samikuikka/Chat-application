import http from 'k6/http';

export const options = {
    duration: "100s",
    vus: 100,
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'p(99.99)', 'count'],
}

export default function () {
    const url = 'http://localhost:7778'
 
    http.get(url)
}