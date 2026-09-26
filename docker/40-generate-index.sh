#!/bin/sh
set -eu

html_root=/usr/share/nginx/html

envsubst '${BASE_URL}' \
  < "$html_root/index.html.template" \
  > "$html_root/index.html"
