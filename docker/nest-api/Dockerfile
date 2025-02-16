FROM node:lts-slim

WORKDIR /usr/src/app

COPY package*.json ./

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
    curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
    apt-get update && \
    apt-get -y install doppler

RUN npm install

COPY . ./

RUN npm install
# recommandation prisma pour docker
RUN apt-get update -y && apt-get install -y openssl

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
