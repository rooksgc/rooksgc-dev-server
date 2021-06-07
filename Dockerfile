FROM node:14

ARG APP_DIR=app
RUN mkdir -p ${APP_DIR}
WORKDIR ${APP_DIR}
COPY package.json /${APP_DIR}
RUN npm install
COPY . /${APP_DIR}

EXPOSE 5000
CMD [ "npm", "start" ]