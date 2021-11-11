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
# docker run -d --rm --name=vbrowser --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e NEKO_SCREEN="1920x1080@30" -e NEKO_PASSWORD=neko -e NEKO_PASSWORD_ADMIN=admin -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" howardc93/vbrowser
