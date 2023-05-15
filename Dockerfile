FROM node:18.15-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY . .
CMD node lib/index.js
