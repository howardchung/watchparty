# thirty-two

Implementation of RFC 3548 Base32 encoding/decoding for node.

## Installation
    
    npm install github:osztenkurden/thirty-two#master

## Usage
```javascript
import base32 from "thirty-two";

base32.encode('node').toString();
// output: NZXWIZI=

base32.decode('NZXWIZI=');
//output: node
```
