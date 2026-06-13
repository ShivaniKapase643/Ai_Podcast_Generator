FROM node:20-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --production

COPY . .

RUN mkdir -p episodes logs

EXPOSE 5000

CMD ["node", "server.js"]
