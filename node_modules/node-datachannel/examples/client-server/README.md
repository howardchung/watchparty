# client-server Example

-   You can use client-server example project to test WebRTC Data Channels with WebSocket signaling.
-   It uses same logic of [libdatachannel/examples/client](https://github.com/paullouisageneau/libdatachannel/tree/master/examples) project.
-   Contains an equivalent implementation for a node.js signaling server

## How to Use?

-   Prepare Project
    -   cd examples/client-server
    -   npm i
-   Start ws signaling server;
    -   node signaling-server.js
-   Start answerer (On a new Console);
    -   node client.js
    -   Note local ID
-   Start Offerer (On a new Console);

    -   node client.js
    -   Enter answerer ID

    > You can also use [libdatachannel/examples/client](https://github.com/paullouisageneau/libdatachannel/tree/master/examples) project's client & signaling server
