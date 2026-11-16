# bitfield

A simple bitfield, compliant with the BitTorrent spec.

    npm install bitfield

#### Example

```js
import Bitfield from "bitfield";

const field = new Bitfield(256); // Create a bitfield with 256 bits.

field.set(128); // Set the 128th bit.
field.set(128, true); // Same as above.

field.get(128); // `true`
field.get(200); // `false` (all values are initialised to `false`)
field.get(1e3); // `false` (out-of-bounds is also false)

field.set(128, false); // Set the 128th bit to 0 again.

field.buffer; // The buffer used by the bitfield.
```

## Class: BitField

### Constructors

-   [constructor](#constructor)

### Properties

-   [buffer](#buffer)

### Methods

-   [forEach](#foreach)
-   [get](#get)
-   [set](#set)

## Constructors

### constructor

\+ **new BitField**(`data?`: number \| Uint8Array, `opts?`: BitFieldOptions): `BitField`

#### Parameters:

| Name    | Type                 | Default value | Description                                                                                                                                                                                                                                                       |
| ------- | -------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`  | number \| Uint8Array | 0             | Either a number representing the maximum number of supported bytes, or a Uint8Array.                                                                                                                                                                              |
| `opts?` | { grow: number }     | { grow: 0 }   | <p>**grow:**<p>If you `set` an index that is out-of-bounds, the bitfield will automatically grow so that the bitfield is big enough to contain the given index, up to the given size (in bit). <p>If you want the Bitfield to grow indefinitely, pass `Infinity`. |

**Returns:** `BitField`

## Properties

### buffer

• **buffer**: Uint8Array

The internal storage of the bitfield.

## Methods

### forEach

▸ **forEach**(`fn`: (bit: boolean, index: number) => void, `start?`: number, `end?`: number): void

Loop through the bits in the bitfield.

#### Parameters:

| Name    | Type                                  | Default value           | Description                                                 |
| ------- | ------------------------------------- | ----------------------- | ----------------------------------------------------------- |
| `fn`    | (bit: boolean, index: number) => void | -                       | Function to be called with the bit value and index.         |
| `start` | number                                | 0                       | Index of the first bit to look at.                          |
| `end`   | number                                | this.buffer.length \* 8 | Index of the first bit that should no longer be considered. |

**Returns:** void

---

### get

▸ **get**(`i`: number): boolean

Get a particular bit.

#### Parameters:

| Name | Type   | Description            |
| ---- | ------ | ---------------------- |
| `i`  | number | Bit index to retrieve. |

**Returns:** boolean

A boolean indicating whether the `i`th bit is set.

---

### set

▸ **set**(`i`: number, `value?`: boolean): void

Set a particular bit.

Will grow the underlying array if the bit is out of bounds and the `grow` option is set.

#### Parameters:

| Name    | Type    | Default value | Description                                  |
| ------- | ------- | ------------- | -------------------------------------------- |
| `i`     | number  | -             | Bit index to set.                            |
| `value` | boolean | true          | Value to set the bit to. Defaults to `true`. |

**Returns:** void

---

### setAll

▸ **setAll**(`array`: `ArrayLike<boolean>`, `offset?`: number): void

Set the bits in the bitfield to the values in the given array.

#### Parameters:

| Name     | Type                 | Default value | Description                           |
| -------- | -------------------- | ------------- | ------------------------------------- |
| `array`  | `ArrayLike<boolean>` | -             | Array of booleans to set the bits to. |
| `offset` | number               | 0             | Index of the first bit to set.        |

**Returns:** void

## License

MIT
