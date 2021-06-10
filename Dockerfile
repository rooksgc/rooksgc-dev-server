FROM node:14

USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package*.json .
RUN npm install
COPY --chown=node:node . .

EXPOSE 5000
