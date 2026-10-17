import { BoxProps, DataAttributes, ElementProps, Factory, MantineColor, MantineRadius, MantineSize, StylesApiProps } from '../../core';
import { ChipGroup } from './ChipGroup/ChipGroup';
export type ChipStylesNames = 'root' | 'input' | 'iconWrapper' | 'checkIcon' | 'label';
export type ChipVariant = 'outline' | 'filled' | 'light';
export type ChipCssVariables = {
    root: '--chip-fz' | '--chip-size' | '--chip-icon-size' | '--chip-padding' | '--chip-checked-padding' | '--chip-radius' | '--chip-bg' | '--chip-hover' | '--chip-color' | '--chip-bd' | '--chip-spacing';
};
export interface ChipProps extends BoxProps, StylesApiProps<ChipFactory>, ElementProps<'input', 'size' | 'onChange'> {
    /** Key of `theme.radius` or any valid CSS value to set `border-radius` @default `'xl'` */
    radius?: MantineRadius;
    /** Controls various properties related to component size @default `'sm'` */
    size?: MantineSize;
    /** Chip input type @default `'checkbox'` */
    type?: 'radio' | 'checkbox';
    /** `label` element associated with the input */
    children: React.ReactNode;
    /** Checked state for controlled component */
    checked?: boolean;
    /** Default checked state for uncontrolled component */
    defaultChecked?: boolean;
    /** Calls when checked state changes */
    onChange?: (checked: boolean) => void;
    /** Controls components colors based on `variant` prop. Key of `theme.colors` or any valid CSS color. @default `theme.primaryColor` */
    color?: MantineColor;
    /** Unique input id */
    id?: string;
    /** Props passed down to the root element */
    wrapperProps?: React.ComponentPropsWithoutRef<'div'> & DataAttributes;
    /** Any element or component to replace default icon */
    icon?: React.ReactNode;
    /** Assigns ref of the root element */
    rootRef?: React.ForwardedRef<HTMLDivElement>;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
}
export type ChipFactory = Factory<{
    props: ChipProps;
    ref: HTMLInputElement;
    stylesNames: ChipStylesNames;
    vars: ChipCssVariables;
    variant: ChipVariant;
    staticComponents: {
        Group: typeof ChipGroup;
    };
}>;
export declare const Chip: import("../..").MantineComponent<{
    props: ChipProps;
    ref: HTMLInputElement;
    stylesNames: ChipStylesNames;
    vars: ChipCssVariables;
    variant: ChipVariant;
    staticComponents: {
        Group: typeof ChipGroup;
    };
}>;
