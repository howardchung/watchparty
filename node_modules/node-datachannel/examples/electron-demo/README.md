# node-datachannel electron demo

Project created with

> `npm init electron-app@latest my-new-app -- --template=webpack`

## Electron Compatibility and Rebuilding

`node-datachannel` uses N-API for creating binaries. Normally `electron` is compatible with N-API binaries, so you should not need to rebuild the binaries.

### If you need anyway, you can use `electron-rebuild` package with some modifications.

Electron does not support `cmake-js` which `node-datachannel` uses as builder.

As a workaround you can use a custom plugin for `electron-forge`.

Package named as [plugin-node-datachannel](https://github.com/murat-dogan/plugin-node-datachannel)

For rebuilding native addon;

```
> npm i https://github.com/murat-dogan/plugin-node-datachannel

# Add plugin to forge.config.js like below
...
{
    name: 'plugin-node-datachannel',
    config: {},
},
...
```

## How to start the demo Application

### Package the App

-   cd examples/electron-demo
-   npm install
-   npm run package

Now the app is built and ready to be used in folder `out`.

### Start Signaling Server

In another terminal, start signaling server as below;

-   cd examples/client-server
-   npm install
-   node signaling-server.js

Now signaling server is ready and running.

### Start App

-   Start 2 instances of the application
-   Copy ID of one instance
-   Paste the copied ID to the other instance
-   Click Connect
