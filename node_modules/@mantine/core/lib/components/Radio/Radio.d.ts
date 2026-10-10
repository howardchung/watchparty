import { BoxProps, DataAttributes, ElementProps, Factory, MantineColor, MantineRadius, MantineSize, StylesApiProps } from '../../core';
import { InlineInputStylesNames } from '../../utils/InlineInput';
import { RadioCard } from './RadioCard/RadioCard';
import { RadioGroup } from './RadioGroup/RadioGroup';
import { RadioIconProps } from './RadioIcon';
import { RadioIndicator } from './RadioIndicator/RadioIndicator';
export type RadioVariant = 'filled' | 'outline';
export type RadioStylesNames = InlineInputStylesNames | 'inner' | 'radio' | 'icon';
export type RadioCssVariables = {
    root: '--radio-size' | '--radio-radius' | '--radio-color' | '--radio-icon-color' | '--radio-icon-size';
};
export interface RadioProps extends BoxProps, StylesApiProps<RadioFactory>, ElementProps<'input', 'size' | 'children'> {
    /** Content of the `label` associated with the radio */
    label?: React.ReactNode;
    /** Key of `theme.colors` or any valid CSS color to set input color in checked state @default `theme.primaryColor` */
    color?: MantineColor;
    /** Controls size of the component @default `'sm'` */
    size?: MantineSize | (string & {});
    /** A component that replaces default check icon */
    icon?: React.FC<RadioIconProps>;
    /** Props passed down to the root element */
    wrapperProps?: React.ComponentPropsWithoutRef<'div'> & DataAttributes;
    /** Position of the label relative to the input @default `'right'` */
    labelPosition?: 'left' | 'right';
    /** Description displayed below the label */
    description?: React.ReactNode;
    /** Error displayed below the label */
    error?: React.ReactNode;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius,` @default `'xl'` */
    radius?: MantineRadius;
    /** Assigns ref of the root element */
    rootRef?: React.ForwardedRef<HTMLDivElement>;
    /** Key of `theme.colors` or any valid CSS color to set icon color, by default value depends on `theme.autoContrast` */
    iconColor?: MantineColor;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
}
export type RadioFactory = Factory<{
    props: RadioProps;
    ref: HTMLInputElement;
    stylesNames: RadioStylesNames;
    vars: RadioCssVariables;
    variant: RadioVariant;
    staticComponents: {
        Group: typeof RadioGroup;
        Card: typeof RadioCard;
        Indicator: typeof RadioIndicator;
    };
}>;
export declare const Radio: import("../..").MantineComponent<{
    props: RadioProps;
    ref: HTMLInputElement;
    stylesNames: RadioStylesNames;
    vars: RadioCssVariables;
    variant: RadioVariant;
    staticComponents: {
        Group: typeof RadioGroup;
        Card: typeof RadioCard;
        Indicator: typeof RadioIndicator;
    };
}>;
