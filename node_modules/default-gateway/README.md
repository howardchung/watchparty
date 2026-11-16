# default-gateway
[![](https://img.shields.io/npm/v/default-gateway.svg?style=flat)](https://www.npmjs.org/package/default-gateway) [![](https://img.shields.io/npm/dm/default-gateway.svg)](https://www.npmjs.org/package/default-gateway) [![](https://packagephobia.com/badge?p=default-gateway)](https://packagephobia.com/result?p=default-gateway)

Obtains the machine's default gateway through `exec` calls to OS routing ints.

- On Linux and Android, the `ip` command must be available (usually provided by the `iproute2` package).
- On Unix (and macOS), the `netstat` command must be available.
- On Windows, `wmic` must be available.
- On IBM i, the `db2util` command must be available (provided by the `db2util` package).

## Usage

```js
import {gateway4async, gateway4sync, gateway6async, gateway6sync} from "default-gateway";

const {gateway, version, int} = await gateway4async();
// gateway = '1.2.3.4', version = 4, int = 'en1'

const {gateway, version, int} = await gateway6async();
// gateway = '2001:db8::1', version = 6,int = 'en2'

const {gateway, version, int} = gateway4sync();
// gateway = '1.2.3.4', version = 4, int = 'en1'

const {gateway, version, int} = gateway6sync();
// gateway = '2001:db8::1', version = 6, int = 'en2'
```

## API
### gateway4async()
### gateway6async()
### gateway4sync()
### gateway6sync()

Returns: `result` *Object*
  - `gateway` *String*: The IP address of the default gateway.
  - `version` *Number*: The IP address version of `gateway`.
  - `int` *String*: The name of the interface. On Windows, this is the network adapter name.

The `gateway` property will always be defined on success, while `int` can be `null` if it cannot be determined. All methods reject/throw on unexpected conditions.

## License

© [silverwind](https://github.com/silverwind), distributed under BSD licence
