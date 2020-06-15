#!/bin/bash

apt-get update
apt-get install -y curl

# install docker
curl -fsSL https://get.docker.com | sh
# pull vbrowser image
docker pull howardc93/vbrowser
# install fonts
apt-get install -y fonts-noto-cjk
# install certbot
DEBIAN_FRONTEND=noninteractive apt-get install -y certbot
certbot certonly --standalone -n --email howardzchung@gmail.com --agree-tos -d dedi1.watchparty.me
chmod -R 755 /etc/letsencrypt/live/
chmod -R 755 /etc/letsencrypt/archive/
