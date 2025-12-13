FROM node:24-alpine

COPY . /usr/src

WORKDIR /usr/src

RUN npm ci

RUN npm run build

ENTRYPOINT ["/bin/sh", "-c" , "npm run server"]