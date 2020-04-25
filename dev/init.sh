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
echo 'version: "2.0"
services:
  neko:
    image: nurdism/neko:chromium
    restart: always
    shm_size: "1gb"
    cap_add:
      - "SYS_ADMIN"
    network: host
    environment:
      DISPLAY: :99.0
      NEKO_PASSWORD: neko
      NEKO_PASSWORD_ADMIN: admin
      NEKO_BIND: :8080
      NEKO_EPR: 59000-59100
' >> docker-compose.yml
docker-compose up