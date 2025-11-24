FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY src ./src

RUN npm install -g typescript ts-node

WORKDIR /app/src

EXPOSE 3000

CMD ["ts-node", "index.ts"]
