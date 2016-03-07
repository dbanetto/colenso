FROM node:latest

COPY package.json /usr/src/app/package.json
RUN cd /usr/src/app ; npm install --production

COPY . /usr/src/app
WORKDIR /usr/src/app

EXPOSE 3000
