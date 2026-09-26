FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/10-normalize-base-url.envsh /docker-entrypoint.d/10-normalize-base-url.envsh
COPY docker/40-generate-index.sh /docker-entrypoint.d/40-generate-index.sh

RUN mv /usr/share/nginx/html/index.html /usr/share/nginx/html/index.html.template \
    && chmod +x /docker-entrypoint.d/10-normalize-base-url.envsh \
    /docker-entrypoint.d/40-generate-index.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
