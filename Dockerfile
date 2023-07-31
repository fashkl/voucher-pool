FROM node:18

WORKDIR /app

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY ./tsconfig.json ./
COPY ./package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["docker-entrypoint.sh"]
