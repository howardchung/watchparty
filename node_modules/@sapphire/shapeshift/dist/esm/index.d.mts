import { InspectOptionsStylized } from 'util';

type ArrayConstraintName = `s.array(T).${'unique' | `length${'LessThan' | 'LessThanOrEqual' | 'GreaterThan' | 'GreaterThanOrEqual' | 'Equal' | 'NotEqual' | 'Range' | 'RangeInclusive' | 'RangeExclusive'}`}()`;
declare function arrayLengthLessThan<T>(value: number, options?: ValidatorOptions): IConstraint<T[]>;
declare function arrayLengthLessThanOrEqual<T>(value: number, options?: ValidatorOptions): IConstraint<T[]>;
declare function arrayLengthGreaterThan<T>(value: number, options?: ValidatorOptions): IConstraint<T[]>;
declare function arrayLengthGreaterThanOrEqual<T>(value: number, options?: ValidatorOptions): IConstraint<T[]>;
declare function arrayLengthEqual<T>(value: number, options?: ValidatorOptions): IConstraint<T[]>;
declare function arrayLengthNotEqual<T>(value: number, options?: ValidatorOptions): IConstraint<T[]>;
declare function arrayLengthRange<T>(start: number, endBefore: number, options?: ValidatorOptions): IConstraint<T[]>;
declare function arrayLengthRangeInclusive<T>(start: number, end: number, options?: ValidatorOptions): IConstraint<T[]>;
declare function arrayLengthRangeExclusive<T>(startAfter: number, endBefore: number, options?: ValidatorOptions): IConstraint<T[]>;

type BigIntConstraintName = `s.bigint().${'lessThan' | 'lessThanOrEqual' | 'greaterThan' | 'greaterThanOrEqual' | 'equal' | 'notEqual' | 'divisibleBy'}()`;
declare function bigintLessThan(value: bigint, options?: ValidatorOptions): IConstraint<bigint>;
declare function bigintLessThanOrEqual(value: bigint, options?: ValidatorOptions): IConstraint<bigint>;
declare function bigintGreaterThan(value: bigint, options?: ValidatorOptions): IConstraint<bigint>;
declare function bigintGreaterThanOrEqual(value: bigint, options?: ValidatorOptions): IConstraint<bigint>;
declare function bigintEqual(value: bigint, options?: ValidatorOptions): IConstraint<bigint>;
declare function bigintNotEqual(value: bigint, options?: ValidatorOptions): IConstraint<bigint>;
declare function bigintDivisibleBy(divider: bigint, options?: ValidatorOptions): IConstraint<bigint>;

type BooleanConstraintName = `s.boolean().${boolean}()`;
declare function booleanTrue(options?: ValidatorOptions): IConstraint<boolean, true>;
declare function booleanFalse(options?: ValidatorOptions): IConstraint<boolean, false>;

type DateConstraintName = `s.date().${'lessThan' | 'lessThanOrEqual' | 'greaterThan' | 'greaterThanOrEqual' | 'equal' | 'notEqual' | 'valid' | 'invalid'}()`;
declare function dateLessThan(value: Date, options?: ValidatorOptions): IConstraint<Date>;
declare function dateLessThanOrEqual(value: Date, options?: ValidatorOptions): IConstraint<Date>;
declare function dateGreaterThan(value: Date, options?: ValidatorOptions): IConstraint<Date>;
declare function dateGreaterThanOrEqual(value: Date, options?: ValidatorOptions): IConstraint<Date>;
declare function dateEqual(value: Date, options?: ValidatorOptions): IConstraint<Date>;
declare function dateNotEqual(value: Date, options?: ValidatorOptions): IConstraint<Date>;
declare function dateInvalid(options?: ValidatorOptions): IConstraint<Date>;
declare function dateValid(options?: ValidatorOptions): IConstraint<Date>;

type NumberConstraintName = `s.number().${'lessThan' | 'lessThanOrEqual' | 'greaterThan' | 'greaterThanOrEqual' | 'equal' | 'equal' | 'notEqual' | 'notEqual' | 'int' | 'safeInt' | 'finite' | 'divisibleBy'}(${string})`;
declare function numberLessThan(value: number, options?: ValidatorOptions): IConstraint<number>;
declare function numberLessThanOrEqual(value: number, options?: ValidatorOptions): IConstraint<number>;
declare function numberGreaterThan(value: number, options?: ValidatorOptions): IConstraint<number>;
declare function numberGreaterThanOrEqual(value: number, options?: ValidatorOptions): IConstraint<number>;
declare function numberEqual(value: number, options?: ValidatorOptions): IConstraint<number>;
declare function numberNotEqual(value: number, options?: ValidatorOptions): IConstraint<number>;
declare function numberInt(options?: ValidatorOptions): IConstraint<number>;
declare function numberSafeInt(options?: ValidatorOptions): IConstraint<number>;
declare function numberFinite(options?: ValidatorOptions): IConstraint<number>;
declare function numberNaN(options?: ValidatorOptions): IConstraint<number>;
declare function numberNotNaN(options?: ValidatorOptions): IConstraint<number>;
declare function numberDivisibleBy(divider: number, options?: ValidatorOptions): IConstraint<number>;

type ObjectConstraintName = `s.object(T.when)`;
type WhenKey = PropertyKey | PropertyKey[];
interface WhenOptions<T extends BaseValidator<any>, Key extends WhenKey> {
    is?: boolean | ((value: Key extends Array<any> ? any[] : any) => boolean);
    then: (predicate: T) => T;
    otherwise?: (predicate: T) => T;
}

type StringConstraintName = `s.string().${`length${'LessThan' | 'LessThanOrEqual' | 'GreaterThan' | 'GreaterThanOrEqual' | 'Equal' | 'NotEqual'}` | 'regex' | 'url' | 'uuid' | 'email' | `ip${'v4' | 'v6' | ''}` | 'date' | 'phone'}()`;
type StringProtocol = `${string}:`;
type StringDomain = `${string}.${string}`;
interface UrlOptions {
    allowedProtocols?: StringProtocol[];
    allowedDomains?: StringDomain[];
}
type UUIDVersion = 1 | 3 | 4 | 5;
interface StringUuidOptions {
    version?: UUIDVersion | `${UUIDVersion}-${UUIDVersion}` | null;
    nullable?: boolean;
}
declare function stringLengthLessThan(length: number, options?: ValidatorOptions): IConstraint<string>;
declare function stringLengthLessThanOrEqual(length: number, options?: ValidatorOptions): IConstraint<string>;
declare function stringLengthGreaterThan(length: number, options?: ValidatorOptions): IConstraint<string>;
declare function stringLengthGreaterThanOrEqual(length: number, options?: ValidatorOptions): IConstraint<string>;
declare function stringLengthEqual(length: number, options?: ValidatorOptions): IConstraint<string>;
declare function stringLengthNotEqual(length: number, options?: ValidatorOptions): IConstraint<string>;
declare function stringEmail(options?: ValidatorOptions): IConstraint<string>;
declare function stringUrl(options?: UrlOptions, validatorOptions?: ValidatorOptions): IConstraint<string>;
declare function stringIp(version?: 4 | 6, options?: ValidatorOptions): IConstraint<string>;
declare function stringRegex(regex: RegExp, options?: ValidatorOptions): IConstraint<string, string>;
declare function stringUuid({ version, nullable }?: StringUuidOptions, options?: ValidatorOptions): IConstraint<string, string>;

interface BaseErrorJsonified {
    name: string;
    message: string;
}
interface BaseConstraintErrorJsonified<T = unknown> extends BaseErrorJsonified {
    constraint: ConstraintErrorNames;
    given: T;
}
interface ExpectedConstraintErrorJsonified<T = unknown> extends BaseConstraintErrorJsonified<T> {
    expected: string;
}
interface ValidationErrorJsonified extends BaseErrorJsonified {
    validator: string;
    given: unknown;
}
interface ExpectedValidationErrorJsonified<T = unknown> extends ValidationErrorJsonified {
    expected: T;
}
interface MissingPropertyErrorJsonified extends BaseErrorJsonified {
    property: PropertyKey;
}
interface MultiplePossibilitiesConstraintErrorJsonified<T = unknown> extends BaseConstraintErrorJsonified<T> {
    expected: readonly string[];
}
interface UnknownEnumValueErrorJsonified extends BaseErrorJsonified {
    value: string | number;
    enumKeys: string[];
    enumMappings: readonly (readonly [string | number, string | number])[];
}
interface UnknownEnumKeyErrorJsonified extends BaseErrorJsonified {
    property: PropertyKey;
    value: unknown;
}

declare const customInspectSymbol: unique symbol;
declare const customInspectSymbolStackLess: unique symbol;
declare abstract class BaseError extends Error {
    toJSON(): BaseErrorJsonified;
    protected [customInspectSymbol](depth: number, options: InspectOptionsStylized): string;
    protected abstract [customInspectSymbolStackLess](depth: number, options: InspectOptionsStylized): string;
}

declare class ExpectedConstraintError<T = unknown> extends BaseConstraintError<T> {
    readonly expected: string;
    constructor(constraint: ConstraintErrorNames, message: string, given: T, expected: string);
    toJSON(): ExpectedConstraintErrorJsonified<T>;
    protected [customInspectSymbolStackLess](depth: number, options: InspectOptionsStylized): string;
}

declare class Result<T, E extends Error = Error> {
    readonly success: boolean;
    readonly value?: T;
    readonly error?: E;
    private constructor();
    isOk(): this is {
        success: true;
        value: T;
    };
    isErr(): this is {
        success: false;
        error: E;
    };
    unwrap(): T;
    static ok<T, E extends Error = Error>(value: T): Result<T, E>;
    static err<T, E extends Error = Error>(error: E): Result<T, E>;
}

type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array;
declare const TypedArrays: {
    readonly Int8Array: (x: unknown) => x is Int8Array;
    readonly Uint8Array: (x: unknown) => x is Uint8Array;
    readonly Uint8ClampedArray: (x: unknown) => x is Uint8ClampedArray;
    readonly Int16Array: (x: unknown) => x is Int16Array;
    readonly Uint16Array: (x: unknown) => x is Uint16Array;
    readonly Int32Array: (x: unknown) => x is Int32Array;
    readonly Uint32Array: (x: unknown) => x is Uint32Array;
    readonly Float32Array: (x: unknown) => x is Float32Array;
    readonly Float64Array: (x: unknown) => x is Float64Array;
    readonly BigInt64Array: (x: unknown) => x is BigInt64Array;
    readonly BigUint64Array: (x: unknown) => x is BigUint64Array;
    readonly TypedArray: (x: unknown) => x is TypedArray;
};
type TypedArrayName = keyof typeof TypedArrays;

type TypedArrayConstraintName = `s.typedArray(T).${'byteLength' | 'length'}${'LessThan' | 'LessThanOrEqual' | 'GreaterThan' | 'GreaterThanOrEqual' | 'Equal' | 'NotEqual' | 'Range' | 'RangeInclusive' | 'RangeExclusive'}()`;
declare function typedArrayByteLengthLessThan<T extends TypedArray>(value: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayByteLengthLessThanOrEqual<T extends TypedArray>(value: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayByteLengthGreaterThan<T extends TypedArray>(value: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayByteLengthGreaterThanOrEqual<T extends TypedArray>(value: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayByteLengthEqual<T extends TypedArray>(value: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayByteLengthNotEqual<T extends TypedArray>(value: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayByteLengthRange<T extends TypedArray>(start: number, endBefore: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayByteLengthRangeInclusive<T extends TypedArray>(start: number, end: number, options?: ValidatorOptions): {
    run(input: T): Result<T, Error> | Result<unknown, ExpectedConstraintError<T>>;
};
declare function typedArrayByteLengthRangeExclusive<T extends TypedArray>(startAfter: number, endBefore: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayLengthLessThan<T extends TypedArray>(value: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayLengthLessThanOrEqual<T extends TypedArray>(value: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayLengthGreaterThan<T extends TypedArray>(value: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayLengthGreaterThanOrEqual<T extends TypedArray>(value: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayLengthEqual<T extends TypedArray>(value: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayLengthNotEqual<T extends TypedArray>(value: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayLengthRange<T extends TypedArray>(start: number, endBefore: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayLengthRangeInclusive<T extends TypedArray>(start: number, end: number, options?: ValidatorOptions): IConstraint<T>;
declare function typedArrayLengthRangeExclusive<T extends TypedArray>(startAfter: number, endBefore: number, options?: ValidatorOptions): IConstraint<T>;

type ConstraintErrorNames = TypedArrayConstraintName | ArrayConstraintName | BigIntConstraintName | BooleanConstraintName | DateConstraintName | NumberConstraintName | ObjectConstraintName | StringConstraintName;
declare abstract class BaseConstraintError<T = unknown> extends BaseError {
    readonly constraint: ConstraintErrorNames;
    readonly given: T;
    constructor(constraint: ConstraintErrorNames, message: string, given: T);
    toJSON(): BaseConstraintErrorJsonified<T>;
}

interface IConstraint<Input, Return extends Input = Input> {
    run(input: Input, parent?: any): Result<Return, BaseConstraintError<Input>>;
}

declare class CombinedError extends BaseError {
    readonly errors: readonly BaseError[];
    constructor(errors: readonly BaseError[], validatorOptions?: ValidatorOptions);
    protected [customInspectSymbolStackLess](depth: number, options: InspectOptionsStylized): string;
}

declare class CombinedPropertyError extends BaseError {
    readonly errors: [PropertyKey, BaseError][];
    constructor(errors: [PropertyKey, BaseError][], validatorOptions?: ValidatorOptions);
    protected [customInspectSymbolStackLess](depth: number, options: InspectOptionsStylized): string;
    private static formatProperty;
}

declare class UnknownEnumValueError extends BaseError {
    readonly value: string | number;
    readonly enumKeys: string[];
    readonly enumMappings: Map<string | number, string | number>;
    constructor(value: string | number, keys: string[], enumMappings: Map<string | number, string | number>, validatorOptions?: ValidatorOptions);
    toJSON(): UnknownEnumValueErrorJsonified;
    protected [customInspectSymbolStackLess](depth: number, options: InspectOptionsStylized): string;
}

declare class ValidationError extends BaseError {
    readonly validator: string;
    readonly given: unknown;
    constructor(validator: string, message: string, given: unknown);
    toJSON(): ValidationErrorJsonified;
    protected [customInspectSymbolStackLess](depth: number, options: InspectOptionsStylized): string;
}

declare class ArrayValidator<T extends unknown[], I = T[number]> extends BaseValidator<T> {
    private readonly validator;
    constructor(validator: BaseValidator<I>, validatorOptions?: ValidatorOptions, constraints?: readonly IConstraint<T>[]);
    lengthLessThan<N extends number>(length: N, options?: ValidatorOptions): ArrayValidator<ExpandSmallerTuples<UnshiftTuple<[...Tuple<I, N>]>>>;
    lengthLessThanOrEqual<N extends number>(length: N, options?: ValidatorOptions): ArrayValidator<ExpandSmallerTuples<[...Tuple<I, N>]>>;
    lengthGreaterThan<N extends number>(length: N, options?: ValidatorOptions): ArrayValidator<[...Tuple<I, N>, I, ...T]>;
    lengthGreaterThanOrEqual<N extends number>(length: N, options?: ValidatorOptions): ArrayValidator<[...Tuple<I, N>, ...T]>;
    lengthEqual<N extends number>(length: N, options?: ValidatorOptions): ArrayValidator<[...Tuple<I, N>]>;
    lengthNotEqual<N extends number>(length: N, options?: ValidatorOptions): ArrayValidator<[...Tuple<I, N>]>;
    lengthRange<S extends number, E extends number>(start: S, endBefore: E, options?: ValidatorOptions): ArrayValidator<Exclude<ExpandSmallerTuples<UnshiftTuple<[...Tuple<I, E>]>>, ExpandSmallerTuples<UnshiftTuple<[...Tuple<I, S>]>>>>;
    lengthRangeInclusive<S extends number, E extends number>(startAt: S, endAt: E, options?: ValidatorOptions): ArrayValidator<Exclude<ExpandSmallerTuples<[...Tuple<I, E>]>, ExpandSmallerTuples<UnshiftTuple<[...Tuple<I, S>]>>>>;
    lengthRangeExclusive<S extends number, E extends number>(startAfter: S, endBefore: E, options?: ValidatorOptions): ArrayValidator<Exclude<ExpandSmallerTuples<UnshiftTuple<[...Tuple<I, E>]>>, ExpandSmallerTuples<[...Tuple<T, S>]>>>;
    unique(options?: ValidatorOptions): this;
    protected clone(): this;
    protected handle(values: unknown): Result<T, ValidationError | CombinedPropertyError>;
}

declare class BigIntValidator<T extends bigint> extends BaseValidator<T> {
    lessThan(number: bigint, options?: ValidatorOptions): this;
    lessThanOrEqual(number: bigint, options?: ValidatorOptions): this;
    greaterThan(number: bigint, options?: ValidatorOptions): this;
    greaterThanOrEqual(number: bigint, options?: ValidatorOptions): this;
    equal<N extends bigint>(number: N, options?: ValidatorOptions): BigIntValidator<N>;
    notEqual(number: bigint, options?: ValidatorOptions): this;
    positive(options?: ValidatorOptions): this;
    negative(options?: ValidatorOptions): this;
    divisibleBy(number: bigint, options?: ValidatorOptions): this;
    abs(options?: ValidatorOptions): this;
    intN(bits: number, options?: ValidatorOptions): this;
    uintN(bits: number, options?: ValidatorOptions): this;
    protected handle(value: unknown): Result<T, ValidationError>;
}

declare class BooleanValidator<T extends boolean = boolean> extends BaseValidator<T> {
    true(options?: ValidatorOptions): BooleanValidator<true>;
    false(options?: ValidatorOptions): BooleanValidator<false>;
    equal<R extends true | false>(value: R, options?: ValidatorOptions): BooleanValidator<R>;
    notEqual<R extends true | false>(value: R, options?: ValidatorOptions): BooleanValidator<R>;
    protected handle(value: unknown): Result<T, ValidationError>;
}

declare class DateValidator extends BaseValidator<Date> {
    lessThan(date: Date | number | string, options?: ValidatorOptions): this;
    lessThanOrEqual(date: Date | number | string, options?: ValidatorOptions): this;
    greaterThan(date: Date | number | string, options?: ValidatorOptions): this;
    greaterThanOrEqual(date: Date | number | string, options?: ValidatorOptions): this;
    equal(date: Date | number | string, options?: ValidatorOptions): this;
    notEqual(date: Date | number | string, options?: ValidatorOptions): this;
    valid(options?: ValidatorOptions): this;
    invalid(options?: ValidatorOptions): this;
    protected handle(value: unknown): Result<Date, ValidationError>;
}

declare class ExpectedValidationError<T> extends ValidationError {
    readonly expected: T;
    constructor(validator: string, message: string, given: unknown, expected: T);
    toJSON(): ExpectedValidationErrorJsonified<T>;
    protected [customInspectSymbolStackLess](depth: number, options: InspectOptionsStylized): string;
}

declare class InstanceValidator<T> extends BaseValidator<T> {
    readonly expected: Constructor<T>;
    constructor(expected: Constructor<T>, validatorOptions?: ValidatorOptions, constraints?: readonly IConstraint<T>[]);
    protected handle(value: unknown): Result<T, ExpectedValidationError<Constructor<T>>>;
    protected clone(): this;
}

declare class LiteralValidator<T> extends BaseValidator<T> {
    readonly expected: T;
    constructor(literal: T, validatorOptions?: ValidatorOptions, constraints?: readonly IConstraint<T>[]);
    protected handle(value: unknown): Result<T, ExpectedValidationError<T>>;
    protected clone(): this;
}

declare class NeverValidator extends BaseValidator<never> {
    protected handle(value: unknown): Result<never, ValidationError>;
}

declare class NullishValidator extends BaseValidator<undefined | null> {
    protected handle(value: unknown): Result<undefined | null, ValidationError>;
}

declare class NumberValidator<T extends number> extends BaseValidator<T> {
    lessThan(number: number, options?: ValidatorOptions): this;
    lessThanOrEqual(number: number, options?: ValidatorOptions): this;
    greaterThan(number: number, options?: ValidatorOptions): this;
    greaterThanOrEqual(number: number, options?: ValidatorOptions): this;
    equal<N extends number>(number: N, options?: ValidatorOptions): NumberValidator<N>;
    notEqual(number: number, options?: ValidatorOptions): this;
    int(options?: ValidatorOptions): this;
    safeInt(options?: ValidatorOptions): this;
    finite(options?: ValidatorOptions): this;
    positive(options?: ValidatorOptions): this;
    negative(options?: ValidatorOptions): this;
    divisibleBy(divider: number, options?: ValidatorOptions): this;
    abs(options?: ValidatorOptions): this;
    sign(options?: ValidatorOptions): this;
    trunc(options?: ValidatorOptions): this;
    floor(options?: ValidatorOptions): this;
    fround(options?: ValidatorOptions): this;
    round(options?: ValidatorOptions): this;
    ceil(options?: ValidatorOptions): this;
    protected handle(value: unknown): Result<T, ValidationError>;
}

declare class ObjectValidator<T extends object, I = UndefinedToOptional<T>> extends BaseValidator<I> {
    readonly shape: MappedObjectValidator<T>;
    readonly strategy: ObjectValidatorStrategy;
    private readonly keys;
    private readonly handleStrategy;
    private readonly requiredKeys;
    private readonly possiblyUndefinedKeys;
    private readonly possiblyUndefinedKeysWithDefaults;
    constructor(shape: MappedObjectValidator<T>, strategy?: ObjectValidatorStrategy, validatorOptions?: ValidatorOptions, constraints?: readonly IConstraint<I>[]);
    strict(options?: ValidatorOptions): this;
    ignore(options?: ValidatorOptions): this;
    passthrough(options?: ValidatorOptions): this;
    partial(options?: ValidatorOptions): ObjectValidator<{
        [Key in keyof I]?: I[Key];
    }>;
    required(options?: ValidatorOptions): ObjectValidator<{
        [Key in keyof I]-?: I[Key];
    }>;
    extend<ET extends object>(schema: ObjectValidator<ET> | MappedObjectValidator<ET>, options?: ValidatorOptions): ObjectValidator<T & ET>;
    pick<K extends keyof I>(keys: readonly K[], options?: ValidatorOptions): ObjectValidator<{
        [Key in keyof Pick<I, K>]: I[Key];
    }>;
    omit<K extends keyof I>(keys: readonly K[], options?: ValidatorOptions): ObjectValidator<{
        [Key in keyof Omit<I, K>]: I[Key];
    }>;
    protected handle(value: unknown): Result<I, ValidationError | CombinedPropertyError>;
    protected clone(): this;
    private handleIgnoreStrategy;
    private handleStrictStrategy;
    private handlePassthroughStrategy;
}
declare enum ObjectValidatorStrategy {
    Ignore = 0,
    Strict = 1,
    Passthrough = 2
}

declare class PassthroughValidator<T extends any | unknown> extends BaseValidator<T> {
    protected handle(value: unknown): Result<T, ValidationError>;
}

declare class RecordValidator<T> extends BaseValidator<Record<string, T>> {
    private readonly validator;
    constructor(validator: BaseValidator<T>, validatorOptions?: ValidatorOptions, constraints?: readonly IConstraint<Record<string, T>>[]);
    protected clone(): this;
    protected handle(value: unknown): Result<Record<string, T>, ValidationError | CombinedPropertyError>;
}

declare class SetValidator<T> extends BaseValidator<Set<T>> {
    private readonly validator;
    constructor(validator: BaseValidator<T>, validatorOptions?: ValidatorOptions, constraints?: readonly IConstraint<Set<T>>[]);
    protected clone(): this;
    protected handle(values: unknown): Result<Set<T>, ValidationError | CombinedError>;
}

declare class StringValidator<T extends string> extends BaseValidator<T> {
    lengthLessThan(length: number, options?: ValidatorOptions): this;
    lengthLessThanOrEqual(length: number, options?: ValidatorOptions): this;
    lengthGreaterThan(length: number, options?: ValidatorOptions): this;
    lengthGreaterThanOrEqual(length: number, options?: ValidatorOptions): this;
    lengthEqual(length: number, options?: ValidatorOptions): this;
    lengthNotEqual(length: number, options?: ValidatorOptions): this;
    email(options?: ValidatorOptions): this;
    url(validatorOptions?: ValidatorOptions): this;
    url(options?: UrlOptions, validatorOptions?: ValidatorOptions): this;
    uuid(validatorOptions?: ValidatorOptions): this;
    uuid(options?: StringUuidOptions, validatorOptions?: ValidatorOptions): this;
    regex(regex: RegExp, options?: ValidatorOptions): this;
    date(options?: ValidatorOptions): this;
    ipv4(options?: ValidatorOptions): this;
    ipv6(options?: ValidatorOptions): this;
    ip(version?: 4 | 6, options?: ValidatorOptions): this;
    phone(options?: ValidatorOptions): this;
    protected handle(value: unknown): Result<T, ValidationError>;
    private isUrlOptions;
    private isStringUuidOptions;
}

declare class TupleValidator<T extends any[]> extends BaseValidator<[...T]> {
    private readonly validators;
    constructor(validators: BaseValidator<[...T]>[], validatorOptions?: ValidatorOptions, constraints?: readonly IConstraint<[...T]>[]);
    protected clone(): this;
    protected handle(values: unknown): Result<[...T], ValidationError | CombinedPropertyError>;
}

declare class UnionValidator<T> extends BaseValidator<T> {
    private validators;
    constructor(validators: readonly BaseValidator<T>[], validatorOptions?: ValidatorOptions, constraints?: readonly IConstraint<T>[]);
    optional(options?: ValidatorOptions): UnionValidator<T | undefined>;
    required(options?: ValidatorOptions): UnionValidator<Exclude<T, undefined>>;
    nullable(options?: ValidatorOptions): UnionValidator<T | null>;
    nullish(options?: ValidatorOptions): UnionValidator<T | null | undefined>;
    or<O>(...predicates: readonly BaseValidator<O>[]): UnionValidator<T | O>;
    protected clone(): this;
    protected handle(value: unknown): Result<T, ValidationError | CombinedError>;
}

declare class MapValidator<K, V> extends BaseValidator<Map<K, V>> {
    private readonly keyValidator;
    private readonly valueValidator;
    constructor(keyValidator: BaseValidator<K>, valueValidator: BaseValidator<V>, validatorOptions?: ValidatorOptions, constraints?: readonly IConstraint<Map<K, V>>[]);
    protected clone(): this;
    protected handle(value: unknown): Result<Map<K, V>, ValidationError | CombinedPropertyError>;
}

declare class DefaultValidator<T> extends BaseValidator<T> {
    private readonly validator;
    private defaultValue;
    constructor(validator: BaseValidator<T>, value: T | (() => T), validatorOptions?: ValidatorOptions, constraints?: readonly IConstraint<T>[]);
    default(value: Exclude<T, undefined> | (() => Exclude<T, undefined>), options?: ValidatorOptions): DefaultValidator<Exclude<T, undefined>>;
    protected handle(value: unknown): Result<T, ValidatorError>;
    protected clone(): this;
}

declare abstract class BaseValidator<T> {
    description?: string;
    protected validatorOptions: ValidatorOptions;
    protected parent?: object;
    protected constraints: readonly IConstraint<T>[];
    protected isValidationEnabled: boolean | (() => boolean) | null;
    constructor(validatorOptions?: ValidatorOptions, constraints?: readonly IConstraint<T>[]);
    setParent(parent: object): this;
    optional(options?: ValidatorOptions): UnionValidator<T | undefined>;
    nullable(options?: ValidatorOptions): UnionValidator<T | null>;
    nullish(options?: ValidatorOptions): UnionValidator<T | null | undefined>;
    array(options?: ValidatorOptions): ArrayValidator<T[]>;
    set(options?: ValidatorOptions): SetValidator<T>;
    or<O>(...predicates: readonly BaseValidator<O>[]): UnionValidator<T | O>;
    transform(cb: (value: T) => T, options?: ValidatorOptions): this;
    transform<O>(cb: (value: T) => O, options?: ValidatorOptions): BaseValidator<O>;
    reshape(cb: (input: T) => Result<T>, options?: ValidatorOptions): this;
    reshape<R extends Result<unknown>, O = InferResultType<R>>(cb: (input: T) => R, options?: ValidatorOptions): BaseValidator<O>;
    default(value: Exclude<T, undefined> | (() => Exclude<T, undefined>), options?: ValidatorOptions): DefaultValidator<Exclude<T, undefined>>;
    when<Key extends WhenKey, This extends BaseValidator<any> = this>(key: Key, options: WhenOptions<This, Key>, validatorOptions?: ValidatorOptions): this;
    describe(description: string): this;
    run(value: unknown): Result<T, BaseError>;
    parse<R extends T = T>(value: unknown): R;
    is<R extends T = T>(value: unknown): value is R;
    /**
     * Sets if the validator should also run constraints or just do basic checks.
     * @param isValidationEnabled Whether this validator should be enabled or disabled. You can pass boolean or a function returning boolean which will be called just before parsing.
     * Set to `null` to go off of the global configuration.
     */
    setValidationEnabled(isValidationEnabled: boolean | (() => boolean) | null): this;
    getValidationEnabled(): boolean | null;
    protected get shouldRunConstraints(): boolean;
    protected clone(): this;
    protected abstract handle(value: unknown): Result<T, ValidatorError>;
    protected addConstraint(constraint: IConstraint<T>, validatorOptions?: ValidatorOptions): this;
}
type ValidatorError = ValidationError | CombinedError | CombinedPropertyError | UnknownEnumValueError;

type Constructor<T> = (new (...args: readonly any[]) => T) | (abstract new (...args: readonly any[]) => T);
type Type<V> = V extends BaseValidator<infer T> ? T : never;
/**
 * Additional options to pass to the validator.
 * Right now this only supports a custom error message, but we provide an option for future expansion.
 */
interface ValidatorOptions {
    /**
     * The custom message to throw when this validation fails.
     */
    message?: string;
}
type FilterDefinedKeys<TObj extends object> = Exclude<{
    [TKey in keyof TObj]: undefined extends TObj[TKey] ? never : TKey;
}[keyof TObj], undefined>;
type UndefinedToOptional<T extends object> = Pick<T, FilterDefinedKeys<T>> & {
    [k in keyof Omit<T, FilterDefinedKeys<T>>]?: Exclude<T[k], undefined>;
};
type MappedObjectValidator<T> = {
    [key in keyof T]: BaseValidator<T[key]>;
};
/**
 * An alias of {@link ObjectValidator} with a name more common among object validation libraries.
 * This is the type of a schema after using `s.object({ ... })`
 * @example
 * ```typescript
 * import { s, SchemaOf } from '@sapphire/shapeshift';
 *
 * interface IIngredient {
 * 	ingredientId: string | undefined;
 * 	name: string | undefined;
 * }
 *
 * interface IInstruction {
 * 	instructionId: string | undefined;
 * 	message: string | undefined;
 * }
 *
 * interface IRecipe {
 * 	recipeId: string | undefined;
 * 	title: string;
 * 	description: string;
 * 	instructions: IInstruction[];
 * 	ingredients: IIngredient[];
 * }
 *
 * type InstructionSchemaType = SchemaOf<IInstruction>;
 * // Expected Type: ObjectValidator<IInstruction>
 *
 * type IngredientSchemaType = SchemaOf<IIngredient>;
 * // Expected Type: ObjectValidator<IIngredient>
 *
 * type RecipeSchemaType = SchemaOf<IRecipe>;
 * // Expected Type: ObjectValidator<IRecipe>
 *
 * const instructionSchema: InstructionSchemaType = s.object({
 * 	instructionId: s.string.optional,
 * 	message: s.string
 * });
 *
 * const ingredientSchema: IngredientSchemaType = s.object({
 * 	ingredientId: s.string.optional,
 * 	name: s.string
 * });
 *
 * const recipeSchema: RecipeSchemaType = s.object({
 * 	recipeId: s.string.optional,
 * 	title: s.string,
 * 	description: s.string,
 * 	instructions: s.array(instructionSchema),
 * 	ingredients: s.array(ingredientSchema)
 * });
 * ```
 */
type SchemaOf<T extends object> = ObjectValidator<T>;
/**
 * Infers the type of a schema object given `typeof schema`.
 * The schema has to extend {@link ObjectValidator}.
 * @example
 * ```typescript
 * import { InferType, s } from '@sapphire/shapeshift';
 *
 * const schema = s.object({
 * 	foo: s.string,
 * 	bar: s.number,
 * 	baz: s.boolean,
 * 	qux: s.bigint,
 * 	quux: s.date
 * });
 *
 * type Inferredtype = InferType<typeof schema>;
 * // Expected type:
 * // type Inferredtype = {
 * // 	foo: string;
 * // 	bar: number;
 * // 	baz: boolean;
 * // 	qux: bigint;
 * // 	quux: Date;
 * // };
 * ```
 */
type InferType<T extends ObjectValidator<any>> = T extends ObjectValidator<any, infer U> ? U : never;
type InferResultType<T extends Result<any>> = T extends Result<infer U> ? U : never;
type UnwrapTuple<T extends [...any[]]> = T extends [infer Head, ...infer Tail] ? [Unwrap<Head>, ...UnwrapTuple<Tail>] : [];
type Unwrap<T> = T extends BaseValidator<infer V> ? V : never;
type UnshiftTuple<T extends [...any[]]> = T extends [T[0], ...infer Tail] ? Tail : never;
type ExpandSmallerTuples<T extends [...any[]]> = T extends [T[0], ...infer Tail] ? T | ExpandSmallerTuples<Tail> : [];
type Shift<A extends Array<any>> = ((...args: A) => void) extends (...args: [A[0], ...infer R]) => void ? R : never;
type GrowExpRev<A extends Array<any>, N extends number, P extends Array<Array<any>>> = A['length'] extends N ? A : GrowExpRev<[...A, ...P[0]][N] extends undefined ? [...A, ...P[0]] : A, N, Shift<P>>;
type GrowExp<A extends Array<any>, N extends number, P extends Array<Array<any>>> = [...A, ...A][N] extends undefined ? GrowExp<[...A, ...A], N, [A, ...P]> : GrowExpRev<A, N, P>;
type Tuple<T, N extends number> = N extends number ? number extends N ? Array<T> : N extends 0 ? [] : N extends 1 ? [T] : GrowExp<[T], N, [[]]> : never;

declare class LazyValidator<T extends BaseValidator<unknown>, R = Unwrap<T>> extends BaseValidator<R> {
    private readonly validator;
    constructor(validator: (value: unknown) => T, validatorOptions?: ValidatorOptions, constraints?: readonly IConstraint<R>[]);
    protected clone(): this;
    protected handle(values: unknown): Result<R, ValidatorError>;
}

declare class NativeEnumValidator<T extends NativeEnumLike> extends BaseValidator<T[keyof T]> {
    readonly enumShape: T;
    readonly hasNumericElements: boolean;
    private readonly enumKeys;
    private readonly enumMapping;
    constructor(enumShape: T, validatorOptions?: ValidatorOptions);
    protected handle(value: unknown): Result<T[keyof T], ValidationError | UnknownEnumValueError>;
    protected clone(): this;
}
interface NativeEnumLike {
    [key: string]: string | number;
    [key: number]: string;
}

declare class TypedArrayValidator<T extends TypedArray> extends BaseValidator<T> {
    private readonly type;
    constructor(type: TypedArrayName, validatorOptions?: ValidatorOptions, constraints?: readonly IConstraint<T>[]);
    byteLengthLessThan(length: number, options?: ValidatorOptions): this;
    byteLengthLessThanOrEqual(length: number, options?: ValidatorOptions): this;
    byteLengthGreaterThan(length: number, options?: ValidatorOptions): this;
    byteLengthGreaterThanOrEqual(length: number, options?: ValidatorOptions): this;
    byteLengthEqual(length: number, options?: ValidatorOptions): this;
    byteLengthNotEqual(length: number, options?: ValidatorOptions): this;
    byteLengthRange(start: number, endBefore: number, options?: ValidatorOptions): this;
    byteLengthRangeInclusive(startAt: number, endAt: number, options?: ValidatorOptions): this;
    byteLengthRangeExclusive(startAfter: number, endBefore: number, options?: ValidatorOptions): this;
    lengthLessThan(length: number, options?: ValidatorOptions): this;
    lengthLessThanOrEqual(length: number, options?: ValidatorOptions): this;
    lengthGreaterThan(length: number, options?: ValidatorOptions): this;
    lengthGreaterThanOrEqual(length: number, options?: ValidatorOptions): this;
    lengthEqual(length: number, options?: ValidatorOptions): this;
    lengthNotEqual(length: number, options?: ValidatorOptions): this;
    lengthRange(start: number, endBefore: number, options?: ValidatorOptions): this;
    lengthRangeInclusive(startAt: number, endAt: number, options?: ValidatorOptions): this;
    lengthRangeExclusive(startAfter: number, endBefore: number, options?: ValidatorOptions): this;
    protected clone(): this;
    protected handle(value: unknown): Result<T, ValidationError>;
}

declare class Shapes {
    string(options?: ValidatorOptions): StringValidator<string>;
    number(options?: ValidatorOptions): NumberValidator<number>;
    bigint(options?: ValidatorOptions): BigIntValidator<bigint>;
    boolean(options?: ValidatorOptions): BooleanValidator<boolean>;
    date(options?: ValidatorOptions): DateValidator;
    object<T extends object>(shape: MappedObjectValidator<T>, options?: ValidatorOptions): ObjectValidator<T, UndefinedToOptional<T>>;
    undefined(options?: ValidatorOptions): BaseValidator<undefined>;
    null(options?: ValidatorOptions): BaseValidator<null>;
    nullish(options?: ValidatorOptions): NullishValidator;
    any(options?: ValidatorOptions): PassthroughValidator<any>;
    unknown(options?: ValidatorOptions): PassthroughValidator<unknown>;
    never(options?: ValidatorOptions): NeverValidator;
    enum<T>(values: readonly T[], options?: ValidatorOptions): UnionValidator<T>;
    nativeEnum<T extends NativeEnumLike>(enumShape: T, options?: ValidatorOptions): NativeEnumValidator<T>;
    literal<T>(value: T, options?: {
        dateOptions?: ValidatorOptions;
        equalsOptions?: ValidatorOptions;
    }): BaseValidator<T>;
    instance<T>(expected: Constructor<T>, options?: ValidatorOptions): InstanceValidator<T>;
    union<T extends BaseValidator<any>[]>(validators: T, options?: ValidatorOptions): UnionValidator<Unwrap<T[number]>>;
    array<T>(validator: BaseValidator<T[][number]>, options?: ValidatorOptions): ArrayValidator<T[], T[][number]>;
    array<T extends unknown[]>(validator: BaseValidator<T[number]>, options?: ValidatorOptions): ArrayValidator<T, T[number]>;
    typedArray<T extends TypedArray>(type?: TypedArrayName, options?: ValidatorOptions): TypedArrayValidator<T>;
    int8Array(options?: ValidatorOptions): TypedArrayValidator<Int8Array>;
    uint8Array(options?: ValidatorOptions): TypedArrayValidator<Uint8Array>;
    uint8ClampedArray(options?: ValidatorOptions): TypedArrayValidator<Uint8ClampedArray>;
    int16Array(options?: ValidatorOptions): TypedArrayValidator<Int16Array>;
    uint16Array(options?: ValidatorOptions): TypedArrayValidator<Uint16Array>;
    int32Array(options?: ValidatorOptions): TypedArrayValidator<Int32Array>;
    uint32Array(options?: ValidatorOptions): TypedArrayValidator<Uint32Array>;
    float32Array(options?: ValidatorOptions): TypedArrayValidator<Float32Array>;
    float64Array(options?: ValidatorOptions): TypedArrayValidator<Float64Array>;
    bigInt64Array(options?: ValidatorOptions): TypedArrayValidator<BigInt64Array>;
    bigUint64Array(options?: ValidatorOptions): TypedArrayValidator<BigUint64Array>;
    tuple<T extends [...BaseValidator<any>[]]>(validators: [...T], options?: ValidatorOptions): TupleValidator<UnwrapTuple<T>>;
    set<T>(validator: BaseValidator<T>, options?: ValidatorOptions): SetValidator<T>;
    record<T>(validator: BaseValidator<T>, options?: ValidatorOptions): RecordValidator<T>;
    map<T, U>(keyValidator: BaseValidator<T>, valueValidator: BaseValidator<U>, options?: ValidatorOptions): MapValidator<T, U>;
    lazy<T extends BaseValidator<unknown>>(validator: (value: unknown) => T, options?: ValidatorOptions): LazyValidator<T, Unwrap<T>>;
}

/**
 * Sets whether validators should run on the input, or if the input should be passed through.
 * @param enabled Whether validation should be done on inputs
 */
declare function setGlobalValidationEnabled(enabled: boolean): void;
/**
 * @returns Whether validation is enabled
 */
declare function getGlobalValidationEnabled(): boolean;

declare class MissingPropertyError extends BaseError {
    readonly property: PropertyKey;
    constructor(property: PropertyKey, validatorOptions?: ValidatorOptions);
    toJSON(): MissingPropertyErrorJsonified;
    protected [customInspectSymbolStackLess](depth: number, options: InspectOptionsStylized): string;
}

declare class MultiplePossibilitiesConstraintError<T = unknown> extends BaseConstraintError<T> {
    readonly expected: readonly string[];
    constructor(constraint: ConstraintErrorNames, message: string, given: T, expected: readonly string[]);
    toJSON(): MultiplePossibilitiesConstraintErrorJsonified<T>;
    protected [customInspectSymbolStackLess](depth: number, options: InspectOptionsStylized): string;
}

declare class UnknownPropertyError extends BaseError {
    readonly property: PropertyKey;
    readonly value: unknown;
    constructor(property: PropertyKey, value: unknown, options?: ValidatorOptions);
    toJSON(): UnknownEnumKeyErrorJsonified;
    protected [customInspectSymbolStackLess](depth: number, options: InspectOptionsStylized): string;
}

declare const s: Shapes;

export { type ArrayConstraintName, ArrayValidator, BaseConstraintError, type BaseConstraintErrorJsonified, BaseError, type BaseErrorJsonified, BaseValidator, type BigIntConstraintName, BigIntValidator, type BooleanConstraintName, BooleanValidator, CombinedError, CombinedPropertyError, type ConstraintErrorNames, type Constructor, type DateConstraintName, DateValidator, DefaultValidator, type ExpandSmallerTuples, ExpectedConstraintError, type ExpectedConstraintErrorJsonified, ExpectedValidationError, type ExpectedValidationErrorJsonified, type GrowExp, type GrowExpRev, type IConstraint, type InferResultType, type InferType, InstanceValidator, LiteralValidator, MapValidator, type MappedObjectValidator, MissingPropertyError, type MissingPropertyErrorJsonified, MultiplePossibilitiesConstraintError, type MultiplePossibilitiesConstraintErrorJsonified, type NativeEnumLike, NativeEnumValidator, NeverValidator, NullishValidator, type NumberConstraintName, NumberValidator, ObjectValidator, ObjectValidatorStrategy, PassthroughValidator, RecordValidator, Result, type SchemaOf, SetValidator, Shapes, type Shift, type StringConstraintName, type StringDomain, type StringProtocol, type StringUuidOptions, StringValidator, type Tuple, TupleValidator, type Type, type TypedArrayConstraintName, TypedArrayValidator, type UUIDVersion, type UndefinedToOptional, UnionValidator, type UnknownEnumKeyErrorJsonified, UnknownEnumValueError, type UnknownEnumValueErrorJsonified, UnknownPropertyError, type UnshiftTuple, type Unwrap, type UnwrapTuple, type UrlOptions, ValidationError, type ValidationErrorJsonified, type ValidatorError, type ValidatorOptions, arrayLengthEqual, arrayLengthGreaterThan, arrayLengthGreaterThanOrEqual, arrayLengthLessThan, arrayLengthLessThanOrEqual, arrayLengthNotEqual, arrayLengthRange, arrayLengthRangeExclusive, arrayLengthRangeInclusive, bigintDivisibleBy, bigintEqual, bigintGreaterThan, bigintGreaterThanOrEqual, bigintLessThan, bigintLessThanOrEqual, bigintNotEqual, booleanFalse, booleanTrue, customInspectSymbol, customInspectSymbolStackLess, dateEqual, dateGreaterThan, dateGreaterThanOrEqual, dateInvalid, dateLessThan, dateLessThanOrEqual, dateNotEqual, dateValid, getGlobalValidationEnabled, numberDivisibleBy, numberEqual, numberFinite, numberGreaterThan, numberGreaterThanOrEqual, numberInt, numberLessThan, numberLessThanOrEqual, numberNaN, numberNotEqual, numberNotNaN, numberSafeInt, s, setGlobalValidationEnabled, stringEmail, stringIp, stringLengthEqual, stringLengthGreaterThan, stringLengthGreaterThanOrEqual, stringLengthLessThan, stringLengthLessThanOrEqual, stringLengthNotEqual, stringRegex, stringUrl, stringUuid, typedArrayByteLengthEqual, typedArrayByteLengthGreaterThan, typedArrayByteLengthGreaterThanOrEqual, typedArrayByteLengthLessThan, typedArrayByteLengthLessThanOrEqual, typedArrayByteLengthNotEqual, typedArrayByteLengthRange, typedArrayByteLengthRangeExclusive, typedArrayByteLengthRangeInclusive, typedArrayLengthEqual, typedArrayLengthGreaterThan, typedArrayLengthGreaterThanOrEqual, typedArrayLengthLessThan, typedArrayLengthLessThanOrEqual, typedArrayLengthNotEqual, typedArrayLengthRange, typedArrayLengthRangeExclusive, typedArrayLengthRangeInclusive };
