FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ \
	&& npm config set fetch-retries 20 \
	&& npm config set fetch-retry-factor 2 \
	&& npm config set fetch-retry-mintimeout 20000 \
	&& npm config set fetch-retry-maxtimeout 300000 \
	&& npm config set fetch-timeout 600000 \
	&& npm config set maxsockets 1 \
	&& npm config set audit false \
	&& npm config set fund false
RUN npm ci --no-audit --no-fund

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
