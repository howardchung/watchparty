import React from 'react';
import { NumberFormatValues, OnValueChange } from 'react-number-format';
import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
import { __BaseInputProps, __InputStylesNames, InputVariant } from '../Input';
export interface NumberInputHandlers {
    increment: () => void;
    decrement: () => void;
}
export type NumberInputStylesNames = 'controls' | 'control' | __InputStylesNames;
export type NumberInputCssVariables = {
    controls: '--ni-chevron-size';
};
export interface NumberInputProps extends BoxProps, Omit<__BaseInputProps, 'pointer'>, StylesApiProps<NumberInputFactory>, ElementProps<'input', 'size' | 'type' | 'onChange'> {
    /** Controlled component value */
    value?: number | string;
    /** Uncontrolled component default value */
    defaultValue?: number | string;
    /** Called when value changes */
    onChange?: (value: number | string) => void;
    /** Called when value changes with `react-number-format` payload */
    onValueChange?: OnValueChange;
    /** Determines whether leading zeros are allowed. If set to `false`, leading zeros are removed when the input value becomes a valid number. @default `true` */
    allowLeadingZeros?: boolean;
    /** If set, negative values are allowed @default `true` */
    allowNegative?: boolean;
    /** Characters which when pressed result in a decimal separator @default `['.', ',']` */
    allowedDecimalSeparators?: string[];
    /** Limits the number of digits that can be entered after the decimal point @default `Infinity` */
    decimalScale?: number;
    /** Character used as a decimal separator @default `'.'` */
    decimalSeparator?: string;
    /** If set, 0s are added after `decimalSeparator` to match given `decimalScale`. @default `false` */
    fixedDecimalScale?: boolean;
    /** Prefix added before the input value */
    prefix?: string;
    /** Suffix added after the input value */
    suffix?: string;
    /** Defines the thousand grouping style. */
    thousandsGroupStyle?: 'thousand' | 'lakh' | 'wan' | 'none';
    /** A function to validate the input value. If this function returns `false`, the `onChange` will not be called and the input value will not change. */
    isAllowed?: (values: NumberFormatValues) => boolean;
    /** If value is passed as string representation of numbers (unformatted) and number is used in any format props like in prefix or suffix in numeric format and format prop in pattern format then this should be passed as `true`. @default `false` */
    valueIsNumericString?: boolean;
    /** Controls input `type` attribute @default `'text'` */
    type?: 'text' | 'tel' | 'password';
    /** A character used to separate thousands */
    thousandSeparator?: string | boolean;
    /** Minimum possible value */
    min?: number;
    /** Maximum possible value */
    max?: number;
    /** Number by which value will be incremented/decremented with up/down controls and keyboard arrows @default `1` */
    step?: number;
    /** If set, the up/down controls are hidden @default `false` */
    hideControls?: boolean;
    /** Controls how value is clamped, `strict` – user is not allowed to enter values that are not in `[min, max]` range, `blur` – user is allowed to enter any values, but the value is clamped when the input loses focus (default behavior), `none` – lifts all restrictions, `[min, max]` range is applied only for controls and up/down keys */
    clampBehavior?: 'strict' | 'blur' | 'none';
    /** If set, decimal values are allowed @default `true` */
    allowDecimal?: boolean;
    /** Increment/decrement handlers */
    handlersRef?: React.ForwardedRef<NumberInputHandlers | undefined>;
    /** Value set to the input when increment/decrement buttons are clicked or up/down arrows pressed if the input is empty @default `0` */
    startValue?: number;
    /** Delay before stepping the value. Can be a number of milliseconds or a function that receives the current step count and returns the delay in milliseconds. */
    stepHoldInterval?: number | ((stepCount: number) => number);
    /** Initial delay in milliseconds before stepping the value. */
    stepHoldDelay?: number;
    /** If set, up/down keyboard events increment/decrement value @default `true` */
    withKeyboardEvents?: boolean;
    /** If set, leading zeros are removed on blur. For example, `00100` -> `100` @default `true` */
    trimLeadingZeroesOnBlur?: boolean;
}
export type NumberInputFactory = Factory<{
    props: NumberInputProps;
    ref: HTMLInputElement;
    stylesNames: NumberInputStylesNames;
    vars: NumberInputCssVariables;
    variant: InputVariant;
}>;
export declare const NumberInput: import("../..").MantineComponent<{
    props: NumberInputProps;
    ref: HTMLInputElement;
    stylesNames: NumberInputStylesNames;
    vars: NumberInputCssVariables;
    variant: InputVariant;
}>;
