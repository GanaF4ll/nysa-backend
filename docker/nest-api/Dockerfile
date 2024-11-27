FROM node:lts-slim

WORKDIR /usr/src/app

COPY . ./

RUN npm install
# recommandation prisma pour docker
RUN apt-get update -y && apt-get install -y openssl

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
