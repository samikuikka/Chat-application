FROM node:18-alpine3.15
RUN mkdir app
WORKDIR /app
COPY . .
RUN npm install
ENV PATH /app/node_modules/.bin:$PATH
EXPOSE 7778
CMD ["astro", "dev"]