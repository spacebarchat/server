#!/bin/sh

sed -i 's/placeholder/'$NGINX_HOST'/' /etc/nginx/sites-enabled/fosscord.conf
certbot --nginx --agree-tos -m $MAIL_CERTBOT --domains $NGINX_HOST --non-interactive --test-cert
nginx -s stop
nginx -g "daemon off;"
