# Setup (First time usage)

> cd test/wpt-tests

> npm i

> git submodule update --init --recursive --depth 1

> cd wpt

> ./wpt make-hosts-file | sudo tee -a /etc/hosts

After your hosts file is configured, the servers will be locally accessible at:

http://web-platform.test:8000/

https://web-platform.test:8443/ \*

To use the web-based runner point your browser to:

http://web-platform.test:8000/tools/runner/index.html

https://web-platform.test:8443/tools/runner/index.html \*

# Running Tests

> npm run test

OR

> npm run:wpt  (Let this run)

> npm run:test (In an other console)

The files that tested are listed in `wpt-test-list.js`. The commented lines need still to be one-by-one tested and uncommented.

Contributions are welcome!

# Run a test for Chrome

./wpt run chrome /webrtc/RTCPeerConnection-addIceCandidate.html

# Latest Test Results

Please check [last-test-results.md](./last-test-results.md) page

