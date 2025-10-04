FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

ENV DEFAULT_LANG=en

COPY --from=build /app/dist /usr/share/nginx/html

RUN sed -i 's/application\/javascript.*js;/application\/javascript                js mjs;/' /etc/nginx/mime.types

RUN sed -i 's|index  index.html index.htm;|index  index.html index.htm;\n        try_files $uri $uri/ /index.html;|' /etc/nginx/conf.d/default.conf

COPY <<'EOF' /docker-entrypoint.d/30-inject-default-lang.sh
#!/bin/sh
set -e

find /usr/share/nginx/html -name "*.html" -exec sed -i \
  "s|<head>|<head>\n  <script>window.DEFAULT_LANG='${DEFAULT_LANG}';</script>|" {} \;

echo "Injected DEFAULT_LANG=${DEFAULT_LANG} into HTML files"
EOF

RUN chmod +x /docker-entrypoint.d/30-inject-default-lang.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
