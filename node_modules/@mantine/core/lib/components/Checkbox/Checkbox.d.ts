import { BoxProps, DataAttributes, ElementProps, Factory, MantineColor, MantineRadius, MantineSize, StylesApiProps } from '../../core';
import { InlineInputStylesNames } from '../../utils/InlineInput';
import { CheckboxCard } from './CheckboxCard/CheckboxCard';
import { CheckboxGroup } from './CheckboxGroup/CheckboxGroup';
import { CheckboxIndicator } from './CheckboxIndicator/CheckboxIndicator';
export type CheckboxVariant = 'filled' | 'outline';
export type CheckboxStylesNames = 'icon' | 'inner' | 'input' | InlineInputStylesNames;
export type CheckboxCssVariables = {
    root: '--checkbox-size' | '--checkbox-radius' | '--checkbox-color' | '--checkbox-icon-color';
};
export interface CheckboxProps extends BoxProps, StylesApiProps<CheckboxFactory>, ElementProps<'input', 'size' | 'children'> {
    /** Unique input id */
    id?: string;
    /** `label` associated with the checkbox */
    label?: React.ReactNode;
    /** Key of `theme.colors` or any valid CSS color to set input background color in checked state @default `theme.primaryColor` */
    color?: MantineColor;
    /** Controls size of the component @default `'sm'` */
    size?: MantineSize | (string & {});
    /** Key of `theme.radius` or any valid CSS value to set `border-radius` @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Props passed down to the root element */
    wrapperProps?: React.ComponentPropsWithoutRef<'div'> & DataAttributes;
    /** Position of the label relative to the input @default `'right'` */
    labelPosition?: 'left' | 'right';
    /** Description displayed below the label */
    description?: React.ReactNode;
    /** Error message displayed below the label */
    error?: React.ReactNode;
    /** Indeterminate state of the checkbox. If set, `checked` prop is ignored. */
    indeterminate?: boolean;
    /** Icon displayed when checkbox is in checked or indeterminate state */
    icon?: React.FC<{
        indeterminate: boolean | undefined;
        className: string;
    }>;
    /** Root element ref */
    rootRef?: React.ForwardedRef<HTMLDivElement>;
    /** Key of `theme.colors` or any valid CSS color to set icon color. By default, depends on `theme.autoContrast`. */
    iconColor?: MantineColor;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
}
export type CheckboxFactory = Factory<{
    props: CheckboxProps;
    ref: HTMLInputElement;
    stylesNames: CheckboxStylesNames;
    vars: CheckboxCssVariables;
    variant: CheckboxVariant;
    staticComponents: {
        Group: typeof CheckboxGroup;
        Indicator: typeof CheckboxIndicator;
        Card: typeof CheckboxCard;
    };
}>;
export declare const Checkbox: import("../..").MantineComponent<{
    props: CheckboxProps;
    ref: HTMLInputElement;
    stylesNames: CheckboxStylesNames;
    vars: CheckboxCssVariables;
    variant: CheckboxVariant;
    staticComponents: {
        Group: typeof CheckboxGroup;
        Indicator: typeof CheckboxIndicator;
        Card: typeof CheckboxCard;
    };
}>;
