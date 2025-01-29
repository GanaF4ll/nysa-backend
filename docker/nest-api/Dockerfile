FROM node:22.13.1-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update -y && apt-get install -y openssl procps

RUN npm install --no-cache

COPY . ./

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
