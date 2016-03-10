FROM node:latest

COPY package.json /usr/src/package.json
RUN cd /usr/src ; npm install --production

ADD . /usr/src/app
WORKDIR /usr/src/app

EXPOSE 3000
