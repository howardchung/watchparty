#!/bin/bash

# install docker
curl -fsSL https://get.docker.com | sh

# coturn
docker run -d --network=host --name=coturn instrumentisto/coturn \
  -n --log-file=stdout \
  --lt-cred-mech --fingerprint \
  --no-multicast-peers --no-cli \
  --no-tlsv1 --no-tlsv1_1 \
  --realm=watchparty \
docker exec -it coturn 'sh -c turnadmin --add -u username -p password -r watchparty'

