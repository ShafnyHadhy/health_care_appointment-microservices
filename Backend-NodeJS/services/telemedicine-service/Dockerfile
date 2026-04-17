FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ \
	&& npm config set fetch-retries 5 \
	&& npm config set fetch-retry-factor 2 \
	&& npm config set fetch-retry-mintimeout 20000 \
	&& npm config set fetch-retry-maxtimeout 120000 \
	&& npm config set fetch-timeout 300000
RUN npm ci --omit=dev

COPY . .

EXPOSE 3007

CMD ["node", "server.js"]
