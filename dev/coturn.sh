#!/bin/bash

# install docker
curl -fsSL https://get.docker.com | sh

# coturn
docker run -d --network=host --name=coturn coturn/coturn \
  -n --log-file=stdout \
  --lt-cred-mech --fingerprint \
  --no-multicast-peers --no-cli \
  --no-tlsv1 --no-tlsv1_1 \
  --realm=watchparty \
# doesn't actually work, manually docker exec bash and run the add
docker exec -it --user nobody coturn "bash -c 'turnadmin --add -u username -p password -r watchparty'"

