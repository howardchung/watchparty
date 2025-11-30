# which-runtime

Detect if you are in Bare or Node and which os etc

```
npm install which-runtime
```

## Usage

``` js
import {
  runtime, // bare, node, or browser
  platform, // the platform string, ie darwin, win32, etc
  arch, // which arch, arm64, ia32, x64 etc
  isBrowser,
  isBare,
  isNode,
  isLinux,
  isWindows,
  isMac,
  isIOS,
  isAndroid
} from 'which-runtime'
```

## License

Apache-2.0
