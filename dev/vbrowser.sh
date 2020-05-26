#!/bin/bash

apt-get update
apt-get install -y curl

# install docker
curl -fsSL https://get.docker.com | sh
# pull vbrowser image
docker pull howardc93/vbrowser
# install fonts
apt-get install -y fonts-noto-cjk
# install dnsutils
apt-get install -y dnsutils
# disable unattended-upgrades
apt-get remove -y unattended-upgrades