#!/bin/bash

# install docker
curl -fsSL https://get.docker.com | sh
# pull vbrowser image
docker pull nurdism/neko:chromium
# install fonts
apt-get install -y fonts-noto-cjk
# disable unattended-upgrades
apt-get remove unattended-upgrades
# install certbot
DEBIAN_FRONTEND=noninteractive apt-get install -y certbot