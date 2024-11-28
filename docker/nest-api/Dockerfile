FROM node:lts-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --cache /usr/src/app/.npm
COPY . ./
RUN apt-get update -y && apt-get install -y openssl

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
