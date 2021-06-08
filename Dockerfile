FROM node:14

ARG APP_DIR=app
RUN mkdir -p ${APP_DIR}
WORKDIR ${APP_DIR}
COPY package*.json ./${APP_DIR}
USER node
RUN npm install
COPY --chown=node:node . /${APP_DIR}

EXPOSE 5000