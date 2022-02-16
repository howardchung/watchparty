#!/bin/bash

apt-get update
apt-get install -y curl

# install docker
curl -fsSL https://get.docker.com | sh
# pull vbrowser image
docker pull howardc93/vbrowser

# install dnsutils (iptables?)
apt-get install -y dnsutils

# disable unattended-upgrades
apt-get remove -y unattended-upgrades

# disable ipv6 on reboot (fixes region detection sometimes)
echo '[Unit]
Description=Disable IPV6

[Service]
Type=oneshot
ExecStart=/bin/sh -c "sysctl -w net.ipv6.conf.all.disable_ipv6=1 && sysctl -w net.ipv6.conf.default.disable_ipv6=1"

[Install]
WantedBy=multi-user.target' > /etc/systemd/system/ipv6.service
systemctl enable ipv6.service

# determine if this is a large or not via nproc
# systemd to start vbrowser
echo '
#!/bin/bash

iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 5000
PASSWORD=$(hostname)
RESOLUTION=$(if [ "$(nproc)" -le "2" ]; then echo "1280x720@30"; else echo "1920x1080@30"; fi)
docker run -d --rm --name=vbrowser --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e NEKO_SCREEN=$RESOLUTION -e NEKO_PASSWORD=$PASSWORD -e NEKO_PASSWORD_ADMIN=$PASSWORD -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" -e NEKO_H264="1" howardc93/vbrowser
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

docker run -d --rm --name=test --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e NEKO_PASSWORD=neko -e NEKO_PASSWORD_ADMIN=admin -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" howardc93/vbrowser
