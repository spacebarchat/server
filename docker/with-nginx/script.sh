#!/bin/sh

sed -i 's/placeholder/'$NGINX_HOST'/' /etc/nginx/sites-enabled/fosscord.conf
certbot --nginx --agree-tos -m $MAIL_CERTBOT --domains $NGINX_HOST --non-interactive --test-cert
SLEEPTIME=$(awk 'BEGIN{srand(); print int(rand()*(3600+1))}'); echo "0 0,12 * * * root sleep $SLEEPTIME && certbot renew -q" | tee -a /etc/crontabs/root > /dev/null
nginx -s stop
nginx -g "daemon off;"
