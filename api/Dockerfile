FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY api ./api

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "api/src/server.js"]
