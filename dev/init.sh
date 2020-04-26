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

# vbrowser
curl -fsSL https://get.docker.com | sh
echo 'version: "2.0"
services:
  neko:
    image: nurdism/neko:chromium
    restart: always
    network: host
    shm_size: "1gb"
    cap_add:
      - "SYS_ADMIN"
    environment:
      DISPLAY: :99.0
      NEKO_PASSWORD: neko
      NEKO_PASSWORD_ADMIN: admin
      NEKO_BIND: :8080
      NEKO_EPR: 59000-59100
' >> docker-compose.yml
docker run -d --rm --name=vbrowser --log-opt max-size=1g --restart=always --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e NEKO_PASSWORD=neko -e NEKO_PASSWORD_ADMIN=admin -e NEKO_BIND=":8080" -e NEKO_EPR=":59000-59100" nurdism/neko:chromium