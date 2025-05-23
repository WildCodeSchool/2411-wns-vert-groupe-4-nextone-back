FROM node:lts-alpine

RUN mkdir /app
WORKDIR /app

COPY package.json .
RUN npm i 


RUN apk --update --no-cache add curl

COPY src src
COPY tsconfig.json .
COPY jest.config.js .
COPY codegen.ts .
COPY __tests__ __tests__

RUN npm run ci-codegen

#script permettant d'attendre le healthy du back avant de lancer codegen.
COPY scripts/wait-for-healthcheck.sh /usr/local/bin/wait-for-healthcheck.sh
RUN chmod +x /usr/local/bin/wait-for-healthcheck.sh