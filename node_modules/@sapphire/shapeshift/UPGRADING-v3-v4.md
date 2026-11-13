# Migration guide for @sapphire/shapeshift v3.x to v4.x

## Introduction

In version 4.x of @sapphire/shapeshift we have changed the entire API to support supplying custom messages for your
errors in order to allow for better localization and customization of the error messages. This guide will help you
migrate your code from v3.x to v4.x.

Before we start we should note that with the amount of changes that have been made it is entirely possible that we have
forgot to mention something in this guide. We therefore strongly recommend the usage of some form of type checking (i.e.
through TypeScript) for your code base to ensure that all your code is compliant and correctly migrated. If you find
that we have failed to mention anything, we would also greatly appreciate a Pull Request to update this document.

## Function changes

In general the biggest change between v3.x and v4.x is that where before you would write validators like this:

```typescript
import { s } from '@sapphire/shapeshift';

const validator = s.string;
```

Wherein `string` would be a getter for our `StringValidator` class, you would now write validators like this:

```typescript
import { s } from '@sapphire/shapeshift';

const validator = s.string();
```

This is to allow for passing arguments to the method, currently only a custom message but potentially more in the
future. These kind of methods accept a single parameter which is an object with a `message` key. This message represents
the custom message that will be available on the error object when the validation fails.

An example of this would be:

```typescript
import { s } from '@sapphire/shapeshift';

const validator = s.string({ message: 'This is a custom message' });
```

For a (non-exhaustive) list of all the methods there we changed please see [List of function changes][lofc] below.

## Type only changes

Three types were removed that were previously marked as `@deprecated` in v3.x. We took the oppertunity of the major
release to remove these deprecated types. For a list of all the types that were removed please see [List of Type Only
changes][lotc] below.

---

## References

### List of function changes

- `s.any` is now `s.any()` to allow for custom options as argument.
- `s.array(T).lengthEqual` is now `s.array(T).lengthEqual()` to allow for custom options as argument.
- `s.array(T).lengthGreaterThan` is now `s.array(T).lengthGreaterThan()` to allow for custom options as argument.
- `s.array(T).lengthGreaterThanOrEqual` is now `s.array(T).lengthGreaterThanOrEqual()` to allow for custom options as
  argument.
- `s.array(T).lengthLessThan` is now `s.array(T).lengthLessThan()` to allow for custom options as argument.
- `s.array(T).lengthLessThanOrEqual` is now `s.array(T).lengthLessThanOrEqual()` to allow for custom options as
  argument.
- `s.array(T).lengthNotEqual` is now `s.array(T).lengthNotEqual()` to allow for custom options as argument.
- `s.array(T).lengthRange` is now `s.array(T).lengthRange()` to allow for custom options as argument.
- `s.array(T).lengthRangeExclusive` is now `s.array(T).lengthRangeExclusive()` to allow for custom options as argument.
- `s.array(T).lengthRangeInclusive` is now `s.array(T).lengthRangeInclusive()` to allow for custom options as argument.
- `s.array(T).unique` is now `s.array(T).unique()` to allow for custom options as argument.
- `s.array` is now `s.array()` to allow for custom options as argument.
- `s.bigint.divisibleBy` is now `s.bigint().divisibleBy()` to allow for custom options as argument.
- `s.bigint.equal` is now `s.bigint().equal()` to allow for custom options as argument.
- `s.bigint.greaterThan` is now `s.bigint().greaterThan()` to allow for custom options as argument.
- `s.bigint.greaterThanOrEqual` is now `s.bigint().greaterThanOrEqual()` to allow for custom options as argument.
- `s.bigint.lessThan` is now `s.bigint().lessThan()` to allow for custom options as argument.
- `s.bigint.lessThanOrEqual` is now `s.bigint().lessThanOrEqual()` to allow for custom options as argument.
- `s.bigint.notEqual` is now `s.bigint().notEqual()` to allow for custom options as argument.
- `s.bigint().abs` is now `s.bigint().abs()` to allow for custom options as second argument.
- `s.bigint().negative` is now `s.bigint().negative()` to allow for custom options as second argument.
- `s.bigint().positive` is now `s.bigint().positive()` to allow for custom options as second argument.
- `s.bigint` is now `s.bigint()` to allow for custom options as argument.
- `s.bigInt64Array` is now `s.bigInt64Array()` to allow for custom options as argument.
- `s.bigUint64Array` is now `s.bigUint64Array()` to allow for custom options as argument.
- `s.boolean.false` is now `s.boolean().false()` to allow for custom options as second argument.
- `s.boolean.true` is now `s.boolean().true()` to allow for custom options as second argument.
- `s.boolean` is now `s.boolean()` to allow for custom options as argument.
- `s.default(...)` now gets a second parameter to allow for custom options as argument.
- `s.default(...).default(...)` now gets a second parameter to allow for custom options as argument.
- `s.date.equal` is now `s.date().equal()` to allow for custom options as argument.
- `s.date.greaterThan` is now `s.date().greaterThan()` to allow for custom options as argument.
- `s.date.greaterThanOrEqual` is now `s.date().greaterThanOrEqual()` to allow for custom options as argument.
- `s.date.invalid` is now `s.date().invalid()` to allow for custom options as argument.
- `s.date.lessThan` is now `s.date().lessThan()` to allow for custom options as argument.
- `s.date.lessThanOrEqual` is now `s.date().lessThanOrEqual()` to allow for custom options as argument.
- `s.date.notEqual` is now `s.date().notEqual()` to allow for custom options as argument.
- `s.date.valid` is now `s.date().valid()` to allow for custom options as argument.
- `s.date` is now `s.date()` to allow for custom options as argument.
- `s.enum(1, 2, 3)` is now `s.enum([1, 2, 3])` to allow for custom options as second argument.
- `s.float32Array` is now `s.float32Array()` to allow for custom options as argument.
- `s.float64Array` is now `s.float64Array()` to allow for custom options as argument.
- `s.int16Array` is now `s.int16Array()` to allow for custom options as argument.
- `s.int32Array` is now `s.int32Array()` to allow for custom options as argument.
- `s.int8Array` is now `s.int8Array()` to allow for custom options as argument.
- `s.never` is now `s.never()` to allow for custom options as argument.
- `s.null` is now `s.null()` to allow for custom options as argument.
- `s.nullable` is now `s.nullable()` to allow for custom options as argument.
- `s.nullish` is now `s.nullish()` to allow for custom options as argument.
- `s.nullish` is now `s.nullish()` to allow for custom options as argument.
- `s.number.abs` is now `s.number().abs()` to allow for custom options as argument.
- `s.number.ceil` is now `s.number().ceil()` to allow for custom options as argument.
- `s.number.divisibleBy` is now `s.number().divisibleBy()` to allow for custom options as argument.
- `s.number.equal` is now `s.number().equal()` to allow for custom options as argument.
- `s.number.finite` is now `s.number().finite()` to allow for custom options as argument.
- `s.number.floor` is now `s.number().floor()` to allow for custom options as argument.
- `s.number.fround` is now `s.number().fround()` to allow for custom options as argument.
- `s.number.greaterThan` is now `s.number().greaterThan()` to allow for custom options as argument.
- `s.number.greaterThanOrEqual` is now `s.number().greaterThanOrEqual()` to allow for custom options as argument.
- `s.number.int` is now `s.number().int()` to allow for custom options as argument.
- `s.number.lessThan` is now `s.number().lessThan()` to allow for custom options as argument.
- `s.number.lessThanOrEqual` is now `s.number().lessThanOrEqual()` to allow for custom options as argument.
- `s.number.negative` is now `s.number().negative()` to allow for custom options as argument.
- `s.number.notEqual` is now `s.number().notEqual()` to allow for custom options as argument.
- `s.number.positive` is now `s.number().positive()` to allow for custom options as argument.
- `s.number.round` is now `s.number().round()` to allow for custom options as argument.
- `s.number.safeInt` is now `s.number().safeInt()` to allow for custom options as argument.
- `s.number.sign` is now `s.number().sign()` to allow for custom options as argument.
- `s.number.trunc` is now `s.number().trunc()` to allow for custom options as argument.
- `s.number` is now `s.number()` to allow for custom options as argument.
- `s.object.ignore` is now `s.object().ignore()` to allow for custom options as argument.
- `s.object.partial` is now `s.object().partial()` to allow for custom options as argument.
- `s.object.passthrough` is now `s.object().passthrough()` to allow for custom options as argument.
- `s.object.required` is now `s.object().required()` to allow for custom options as argument.
- `s.object.strict` is now `s.object().strict()` to allow for custom options as argument.
- `s.optional` is now `s.optional()` to allow for custom options as argument.
- `s.required(...)` now gets a second parameter to allow for custom options as argument.
- `s.set` is now `s.set()` to allow for custom options as argument.
- `s.string.date` is now `s.string().date()` to allow for custom options as argument.
- `s.string.email` is now `s.string().email()` to allow for custom options as argument.
- `s.string.ipv4` is now `s.string().ipv4()` to allow for custom options as argument.
- `s.string.ipv6` is now `s.string().ipv6()` to allow for custom options as argument.
- `s.string().ip` is now `s.string().ip()` to allow for custom options as argument.
- `s.string().lengthEqual` is now `s.string().lengthEqual()` to allow for custom options as argument.
- `s.string().lengthGreaterThan` is now `s.string().lengthGreaterThan()` to allow for custom options as argument.
- `s.string().lengthGreaterThanOrEqual` is now `s.string().lengthGreaterThanOrEqual()` to allow for custom options as
  argument.
- `s.string().lengthLessThan` is now `s.string().lengthLessThan()` to allow for custom options as argument.
- `s.string().lengthLessThanOrEqual` is now `s.string().lengthLessThanOrEqual()` to allow for custom options as
  argument.
- `s.string().lengthNotEqual` is now `s.string().lengthNotEqual()` to allow for custom options as argument.
- `s.string().phone` is now `s.string().phone()` to allow for custom options as argument.
- `s.string().regex` is now `s.string().regex()` to allow for custom options as argument.
- `s.string().url` is now `s.string().url()` to allow for custom options as argument.
- `s.string` is now `s.string()` to allow for custom options as argument.
- `s.tuple(1, 2, 3)` is now `s.tuple([1, 2, 3])` to allow for custom options as second argument.
- `s.typedArray(T).byteLengthEqual` is now `s.typedArray(T).byteLengthEqual()` to allow for custom options as argument.
- `s.typedArray(T).byteLengthGreaterThan` is now `s.typedArray(T).byteLengthGreaterThan()` to allow for custom options
  as argument.
- `s.typedArray(T).byteLengthGreaterThanOrEqual` is now `s.typedArray(T).byteLengthGreaterThanOrEqual()` to allow for
  custom options as argument.
- `s.typedArray(T).byteLengthLessThan` is now `s.typedArray(T).byteLengthLessThan()` to allow for custom options as
  argument.
- `s.typedArray(T).byteLengthLessThanOrEqual` is now `s.typedArray(T).byteLengthLessThanOrEqual()` to allow for custom
  options as argument.
- `s.typedArray(T).byteLengthNotEqual` is now `s.typedArray(T).byteLengthNotEqual()` to allow for custom options as
  argument.
- `s.typedArray(T).byteLengthRange` is now `s.typedArray(T).byteLengthRange()` to allow for custom options as argument.
- `s.typedArray(T).byteLengthRangeExclusive` is now `s.typedArray(T).byteLengthRangeExclusive()` to allow for custom
  options as argument.
- `s.typedArray(T).byteLengthRangeInclusive` is now `s.typedArray(T).byteLengthRangeInclusive()` to allow for custom
  options as argument.
- `s.typedArray(T).lengthEqual` is now `s.typedArray(T).lengthEqual()` to allow for custom options as argument.
- `s.typedArray(T).lengthGreaterThan` is now `s.typedArray(T).lengthGreaterThan()` to allow for custom options as
  argument.
- `s.typedArray(T).lengthGreaterThanOrEqual` is now `s.typedArray(T).lengthGreaterThanOrEqual()` to allow for custom
  options as argument.
- `s.typedArray(T).lengthLessThan` is now `s.typedArray(T).lengthLessThan()` to allow for custom options as argument.
- `s.typedArray(T).lengthLessThanOrEqual` is now `s.typedArray(T).lengthLessThanOrEqual()` to allow for custom options
  as argument.
- `s.typedArray(T).lengthNotEqual` is now `s.typedArray(T).lengthNotEqual()` to allow for custom options as argument.
- `s.typedArray(T).lengthRange` is now `s.typedArray(T).lengthRange()` to allow for custom options as argument.
- `s.typedArray(T).lengthRangeExclusive` is now `s.typedArray(T).lengthRangeExclusive()` to allow for custom options as
  argument.
- `s.typedArray(T).lengthRangeInclusive` is now `s.typedArray(T).lengthRangeInclusive()` to allow for custom options as
  argument.
- `s.uint16Array` is now `s.uint16Array()` to allow for custom options as argument.
- `s.uint32Array` is now `s.uint32Array()` to allow for custom options as argument.
- `s.uint8Array` is now `s.uint8Array()` to allow for custom options as argument.
- `s.uint8ClampedArray` is now `s.uint8ClampedArray()` to allow for custom options as argument.
- `s.undefined` is now `s.undefined()` to allow for custom options as argument.
- `s.union(1, 2, 3).required` is now `s.union(1, 2, 3).required()` to allow for custom options as argument.
- `s.union(1, 2, 3)` is now `s.union([1, 2, 3])` to allow for custom options as second argument.
- `s.unknown` is now `s.unknown()` to allow for custom options as argument.
- `uniqueArray` is now a function (instead of a constant) to allow for custom options as argument.
- `dateInvalid` is now a function (instead of a constant) to allow for custom options as argument.
- `dateValid` is now a function (instead of a constant) to allow for custom options as argument.
- `numberFinite` is now a function (instead of a constant) to allow for custom options as argument.
- `numberInt` is now a function (instead of a constant) to allow for custom options as argument.
- `numberNaN` is now a function (instead of a constant) to allow for custom options as argument.
- `numberNotNaN` is now a function (instead of a constant) to allow for custom options as argument.
- `numberSafeInt` is now a function (instead of a constant) to allow for custom options as argument.

## List of Type Only changes

- `PickDefined` utility type has been removed.
- `PickUndefinedMakeOptional` utility type has been removed.
- `NonNullObject` utility type has been removed.

[lofc]: #list-of-function-changes
[lotc]: #list-of-type-only-changes
[lovcf]: #list-of-validators-that-were-changed-to-functions
