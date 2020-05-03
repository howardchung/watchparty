#!/bin/bash
# Stores Docker commands for booting external servers

# PeerStream (not Dockerized yet)

# coturn
docker run -d --network=host instrumentisto/coturn \
  -n --log-file=stdout \
  --lt-cred-mech --fingerprint \
  --no-multicast-peers --no-cli \
  --no-tlsv1 --no-tlsv1_1 \
  --realm=watchparty \  
# TODO use turnadmin to create username and password

# vbrowser userdata
# Generate cert with letsencrypt
sleep 30
certbot certonly --standalone -n --agree-tos --email howardzchung@gmail.com --domains 9c689d91-db44-43c9-85d1-3179a081e16a.pub.cloud.scaleway.com
# Certs created in /etc/letsencrypt/live/9c689d91-db44-43c9-85d1-3179a081e16a.pub.cloud.scaleway.com
# chmod 0755 /etc/letsencrypt/{live,archive}

# start browser
docker run -d --rm --name=vbrowser -v /etc/letsencrypt/archive/azure.howardchung.net:/cert --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e NEKO_SCREEN="1280x720@30" -e NEKO_PASSWORD=neko -e NEKO_PASSWORD_ADMIN=admin -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" -e NEKO_KEY="/cert/privkey1.pem" -e NEKO_CERT="/cert/cert1.pem" nurdism/neko:chromium