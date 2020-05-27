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

