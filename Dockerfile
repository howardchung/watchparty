FROM node:24.11.1-alpine3.22

COPY . /usr/src

WORKDIR /usr/src

RUN npm install

RUN npm run build

ENTRYPOINT ["/bin/sh", "-c" , "npm run server"]