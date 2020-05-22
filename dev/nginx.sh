#!/bin/bash

apt update

DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-dns-cloudflare
certbot certonly --standalone -n --email howardzchung@gmail.com --agree-tos -d $(hostname).watchparty.me
#certbot certonly --dns-cloudflare --dns-cloudflare-credentials ~/cloudflare.ini -d *.watchparty.me --preferred-challenges dns-01

apt install -y nginx

echo 'events {}
http {
  server {
    listen 443 ssl;
    server_name HOSTNAME_PLACEHOLDER.watchparty.me;
    ssl_certificate /etc/letsencrypt/live/HOSTNAME_PLACEHOLDER.watchparty.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/HOSTNAME_PLACEHOLDER.watchparty.me/privkey.pem;

    location / {
        resolver 8.8.8.8;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_pass http://$arg_ip;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
  }
}' | sed "s/HOSTNAME_PLACEHOLDER/$(hostname)/g" > /etc/nginx/nginx.conf
/etc/init.d/nginx reload