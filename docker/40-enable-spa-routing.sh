#!/bin/sh
set -eu

config=/etc/nginx/conf.d/default.conf

if ! grep -Fq 'try_files $uri $uri/ /index.html;' "$config"; then
  sed -i 's|index  index.html index.htm;|index  index.html index.htm;\n        try_files $uri $uri/ /index.html;|' "$config"
fi
