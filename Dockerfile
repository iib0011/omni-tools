FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN sed -i 's/application\/javascript.*js;/application\/javascript                js mjs;/' /etc/nginx/mime.types

COPY docker/40-enable-spa-routing.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/40-enable-spa-routing.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
