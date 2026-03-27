FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN sed -i 's/application\/javascript.*js;/application\/javascript                js mjs;/' /etc/nginx/mime.types

RUN sed -i 's|index  index.html index.htm;|index  index.html index.htm;\n        try_files $uri $uri/ /index.html;|' /etc/nginx/conf.d/default.conf

# Explicitly add IPv6 listen directive since the nginx entrypoint script
# (10-listen-on-ipv6-by-default.sh) skips IPv6 configuration when it detects
# that default.conf has already been modified (see issue #264).
RUN sed -i 's|listen       80;|listen       80;\n    listen  [::]:80;|' /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
