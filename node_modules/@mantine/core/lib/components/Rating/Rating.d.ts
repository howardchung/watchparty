import { BoxProps, ElementProps, Factory, MantineColor, MantineSize, StylesApiProps } from '../../core';
export type RatingStylesNames = 'root' | 'starSymbol' | 'input' | 'label' | 'symbolBody' | 'symbolGroup';
export type RatingCssVariables = {
    root: '--rating-size' | '--rating-color';
};
export interface RatingProps extends BoxProps, StylesApiProps<RatingFactory>, ElementProps<'div', 'onChange'> {
    /** Uncontrolled component default value */
    defaultValue?: number;
    /** Controlled component value */
    value?: number;
    /** Called when value changes */
    onChange?: (value: number) => void;
    /** Icon displayed when the symbol is empty */
    emptySymbol?: React.ReactNode | ((value: number) => React.ReactNode);
    /** Icon displayed when the symbol is full */
    fullSymbol?: React.ReactNode | ((value: number) => React.ReactNode);
    /** Number of fractions each item can be divided into @default `1` */
    fractions?: number;
    /** Controls component size @default `'sm'` */
    size?: MantineSize | number | (string & {});
    /** Number of controls @default `5` */
    count?: number;
    /** Called when one of the controls is hovered */
    onHover?: (value: number) => void;
    /** A function to assign `aria-label` of the the control at index given in the argument. If not specified, control index is used as `aria-label`. */
    getSymbolLabel?: (index: number) => string;
    /** `name` attribute passed down to all inputs. By default, `name` is generated randomly. */
    name?: string;
    /** If set, the user cannot interact with the component @default `false` */
    readOnly?: boolean;
    /** If set, only the selected symbol changes to full symbol when selected @default `false` */
    highlightSelectedOnly?: boolean;
    /** Key of `theme.colors` or any CSS color value @default `'yellow'` */
    color?: MantineColor;
}
export type RatingFactory = Factory<{
    props: RatingProps;
    ref: HTMLDivElement;
    stylesNames: RatingStylesNames;
    vars: RatingCssVariables;
}>;
export declare const Rating: import("../..").MantineComponent<{
    props: RatingProps;
    ref: HTMLDivElement;
    stylesNames: RatingStylesNames;
    vars: RatingCssVariables;
}>;
