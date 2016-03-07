FROM node:latest

COPY package.json /usr/src/app/package.json
RUN cd /usr/src/app ; npm install --production

ADD . /usr/src/app

EXPOSE 3000
ENTRYPOINT ["node", "/usr/src/app/bin/www"]
