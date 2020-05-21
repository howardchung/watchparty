#!/bin/bash

# install docker
curl -fsSL https://get.docker.com | sh
# pull vbrowser image
docker pull nurdism/neko:chromium
# install fonts
apt-get install -y fonts-noto-cjk
# install dnsutils
apt-get install -y dnsutils
# disable unattended-upgrades
apt-get remove -y unattended-upgrades