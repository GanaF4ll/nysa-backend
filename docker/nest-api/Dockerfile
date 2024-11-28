FROM node:lts-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install && npm cache clean --force
COPY . ./
RUN apt-get update -y && apt-get install -y openssl

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
