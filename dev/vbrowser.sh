#!/bin/bash

# apt-get update
# apt-get install -y curl

# install docker (if not already installed)
# curl -fsSL https://get.docker.com | sh

# install dnsutils (iptables?)
apt-get install -y dnsutils

# disable unattended-upgrades
# apt-get remove -y unattended-upgrades

# determine if this is a large or not via nproc
# This systemd config starts the vbrowser on reboot (or instances created from a snapshot of this init vm)
echo '
#!/bin/bash

iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 5000
PASSWORD=$(uuidgen)
#RESOLUTION=$(if [ "$(nproc)" -le "2" ]; then echo "1280x720@30"; else echo "1920x1080@30"; fi)
RESOLUTION="1280x720@30"
ADMIN_KEY={VBROWSER_ADMIN_KEY}
# docker pull howardc93/vbrowser
docker run -d --rm --name=vbrowser --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e NEKO_SCREEN=$RESOLUTION -e NEKO_PASSWORD=$PASSWORD -e NEKO_PASSWORD_ADMIN=$PASSWORD -e NEKO_ADMIN_KEY=$ADMIN_KEY -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" -e NEKO_H264="1" howardc93/vbrowser
' > /etc/systemd/system/vbrowser.sh
chmod u+x /etc/systemd/system/vbrowser.sh

echo '[Unit]
Description=Start VBrowser

[Service]
Type=oneshot
ExecStart=bash /etc/systemd/system/vbrowser.sh

[Install]
WantedBy=multi-user.target' > /etc/systemd/system/vbrowser.service
systemctl enable vbrowser.service

# This ensures the image is pre-pulled and also creates an endpoint for updateSnapshot to check
docker run -d --rm --name=test --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e NEKO_PASSWORD=neko -e NEKO_PASSWORD_ADMIN=admin -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" howardc93/vbrowser
