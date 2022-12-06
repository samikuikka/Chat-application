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

Test were done with K6 using 10 virtual users for 10 seconds. The application
uses only 1 screen for showing messages and comments and api has two endpoints:
one for sending messages and one for sending comments.

This is why there are 3 tests, one for loading the main page, one for sending
message and final for sending comment to the message.

| **test**     | **avg** (ms) | **med**(ms) | **p95** (ms) | **p99** (ms) |
| ------------ | ------------ | ----------- | ------------ | ------------ |
| main page    | 73.15        | 64.06       | 117.99       | 175.61       |
| post message | 64.85        | 48.49       | 79.47        | 111.98       |
| post comment | 71.38        | 65.69       | 121.63       | 163.91       |

## Lighthouse report

| Performance | Accessability | Best Practices | SEO |
| ----------- | ------------- | -------------- | --- |
| 74          | 79            | 92             | 89  |
