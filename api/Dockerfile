FROM denoland/deno:alpine-1.28.3

EXPOSE 7777

WORKDIR /app

COPY . .

RUN deno cache deps.js

CMD [ "run", "--watch", "--allow-net", "--allow-read", "--allow-run", "--allow-env", "--allow-write", "--no-check", "--unstable", "app.js" ]