# Project 3

## Running project on Docker

### Prerequisites

Docker and docker-compose needed for running the application. Check out
[Docker Desktop](https://www.docker.com/products/docker-desktop/) if you have
not them yet installed.

### Steps

1. Go to folder containing the dokcer-compose.yml and run the docker compose

```bash
docker-compose up --build
```

or

```bash
docker-compose build --no-cache
docker-compose up
```

!! If your system has containers with same names than the ones in the
docker-compose, rename the container names and start again.

2. !! WAIT UNTIL **FLYWAY** HAS LOADED

The actual website if faster available than the database migrations, thus you
need to wait until flyway notifies succesfully about database migration in
terminal. DO NOT OPEN THE APP BEFORE!!

3. Open the application in http://localhost:7800

If any of the steps fail, please retry these steps. I have noticed that
sometimes API doe not start in the first try, but running the application again
with `docker-compose up` fixes the problem.

## Running the performance tests

In order to run the tests, the application needs to be running in Docker (not in
Kubernetes). Tests can be found in load_tests folder.

1. Navigate to load_tests folder
2. Run the tests in Docker

```bash
docker run --rm -i --network=host grafana/k6 run - <main_page.js
docker run --rm -i --network=host grafana/k6 run - <post_message.js
docker run --rm -i --network=host grafana/k6 run - <post_comment.js
```

Some things to note. Deno was not optimal choice for the project using
WebSockets, and I learned that Deno has
[uncatchable broken pipe errors](https://github.com/denoland/deno/issues/14240)
when working with WebSockets. If one of those uncatchable errors occur, try to
restart the application and run the tests again. Docker may also log the warning
of the broken pipes, but these do not affect the tests. If errors occur even
after restarting, change the virtual user amount to 1, from my previous
observations, changing virtual users in current tests do not have huge impact on
the amount of requests.

## Running the application on Kubernetes

### Prerequisites

In order to run the application in Kubernetes, make sure you have minikube and
kubectl downloaded in your machine. More info about downloading minikube in
[here](https://minikube.sigs.k8s.io/docs/start/) And about kubectl in
[here](https://kubernetes.io/docs/tasks/tools/) Also Docker needed for running
the minikube. Docker desktop recommended, more info about it
[here](https://www.docker.com/products/docker-desktop/)

### Steps

1. Start your Docker desktop (or anything where you can run minikube docker
   container)

2. Start the minikube

```bash
minikube start
```

!! If step 8 does not show CPU's, then use

```bash
minikube start --extra-config=kubelet.housekeeping-interval=10s
```

3. (optional) Open the minikube dashboard in new terminal window

```bash
minikube dashboard
```

Optional step, but recommended because you see easily if something goes wrong.

4. Build the minikube images

4.1) Build the api image

```bash
cd api
minikube image build -t kub-chat-api .
cd ..
```

4.2) Build the ui image

```bash
cd ui
minikube image build -t kub-chat-ui .
cd ..
```

4.3) Build the flyway image

```bash
cd flyway
minikube image build -t chat-flyway-migrations .
cd ..
```

5. Deploy the database

5.1) Install CloudNativePG

```bash
kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.18/releases/cnpg-1.18.0.yaml
```

At this point, minikube might need a restart.

5.2) Deploy the database

```bash
kubectl apply -f kubernetes/db-config.yaml
```

Now you should see two databases running on minikube dashboard (if you started
it).

6. Add addons to minikube

```bash
minikube addons enable metrics-server  
minikube addons enable ingress
```

7. Apply all the other yaml files

```bash
kubectl apply -f kubernetes
```

8. Autoscale the UI and API

```bash
kubectl autoscale deployment.apps/chat-api-app --min=1 --max=5 --cpu-percent=25
kubectl autoscale deployment.apps/chat-ui-app --min=1 --max=5 --cpu-percent=25
```

9. Expose the ports, so you can see it in your browser.

Open a new terminal window

```bash
minikube tunnel
```

After a while, you should see the ui in http://localhost:7778 and api in
http://localhost:7777

!! Make sure you did not have anything already running on these ports !!

## Performance test results

Test to main page were done with K6 using 10 virtual users for 10 seconds. There
are also two backend tests: one for sending message and one for sending comment.
Backend tests were done with 2 virtual users for 10 seconds. Currently Deno has
problems with already mentioned uncatchable broken pipe errors, and by
decreasing the amount of virtual users I could minimize the probability of it
occurring while testing. Luckily, this did not affect much for the amount of
requests done in the timeframe. Also the speed of new messages/ comments in
current tests are already too fast for any human to read, so these tests can be
seen more of stress test than load tests. and thus the smaller amount of virtual
users in test do not have affect.

The WebSocket tests are done with k6, which means that WebSocket tests do not
load the actual web page, it just creates a web socket connection and send /
retrieves information using the connection. However, the way the actual frontend
retrieves the information is similar to the k6 tests, thus the time taken for
frontend to retrieve new messages / comments is similar to the k6 tests
estimates. I have put more comments on the actual logic of the tests as comments
to the code.

| **test**     | **avg** (ms) | **med**(ms) | **p95** (ms) | **p99** (ms) |
| ------------ | ------------ | ----------- | ------------ | ------------ |
| main page    | 73.15        | 64.06       | 117.99       | 175.61       |
| post message | 61.82        | 47.28       | 75.76        | 89.12        |
| post comment | 44.44        | 39.32       | 54.75        | 67.83        |

## Lighthouse report

| Performance | Accessability | Best Practices | SEO |
| ----------- | ------------- | -------------- | --- |
| 74          | 79            | 92             | 89  |

## Reflection on performance

I was quite suprised on the "poor" lighthouse report performance metric. I chose
the Astro as frontend only to increase the performance but in this project I
don't see any huge improvements on that. Would be interesting to see the
difference if some other framework would be used. The perfromance for the
backend is ok considering all the poor design choices (more in next section)
that I took.

One thing I don't understand is the difference between post message and post
comment tests. Both of them are similar "INSERT INTO" statements + retrieving
the new message information from the backend. However, post comment has every
metric lower than the post message route. More tests should be done for these
routes to see if actually there is difference between the routes.

## Reflection on improving performance

Many of the design choices were not based on the improving performance. Here's
list of possible improvements:

1. Frontend technology choices

I used React compoennts for pretty much everything in the application, but the
actual logic of the frontend is quitesimple and could be done in plain
javascript and Astro components. Now I need to load extra javascript for
handling these React components. So, in order to improve the performance on
frontend, I could refactor the React out of the project.

2. Astro dev

The project uses Astro dev command to show the website. Better option would be
to build the project and host the builded files as static site.

3. Frontend compression

Almost the same thing than the previous. Now the frontend code is not
compressed, thus taking more time to load. The JavaScript used could be
minified.

4. Cache

Cache could be implemented in the backend. Currently every request isretrieved
from the databse which takes time. However, current 20 newest messages could be
cached to the cache db such as Redis and retrieved from there. This could
improve the backend queries a lot.

5. Queue

All the logic currently is about the 20 most recent messages. I could implement
queue for keeping track of latest 20 messages. Then I could just retrieve the
messages straight from backend, and only save the messages when they leave the
queue.

6. Database

Probably the first thing I would want to change from this project si the actual
database implementation. Currently the databse uses PostgresSQL but there is
absolutely no need for relational databases. It would make much more sense if
for example document-based databse would be used. Then I could just store json
object straight to database and there would be no need for individual message
and comment object, because I could save the comments as list to the message
object. This way I don't need to do table joins and weird sql syntax to get all
the relevant information in one query.
