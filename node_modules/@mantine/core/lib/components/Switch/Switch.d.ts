import { BoxProps, DataAttributes, ElementProps, Factory, MantineColor, MantineRadius, MantineSize, StylesApiProps } from '../../core';
import { InlineInputStylesNames } from '../../utils/InlineInput';
import { SwitchGroup } from './SwitchGroup/SwitchGroup';
export type SwitchStylesNames = 'root' | 'track' | 'trackLabel' | 'thumb' | 'input' | InlineInputStylesNames;
export type SwitchCssVariables = {
    root: '--switch-radius' | '--switch-height' | '--switch-width' | '--switch-thumb-size' | '--switch-label-font-size' | '--switch-track-label-padding' | '--switch-color';
};
export interface SwitchProps extends BoxProps, StylesApiProps<SwitchFactory>, ElementProps<'input', 'size' | 'children'> {
    /** Id used to bind input and label, if not passed, unique id will be generated instead */
    id?: string;
    /** Content of the `label` associated with the radio */
    label?: React.ReactNode;
    /** Inner label when the `Switch` is in unchecked state */
    offLabel?: React.ReactNode;
    /** Inner label when the `Switch` is in checked state */
    onLabel?: React.ReactNode;
    /** Key of `theme.colors` or any valid CSS color to set input color in checked state @default `theme.primaryColor` */
    color?: MantineColor;
    /** Controls size of all elements */
    size?: MantineSize | (string & {});
    /** Key of `theme.radius` or any valid CSS value to set `border-radius,` @default `'xl'` */
    radius?: MantineRadius;
    /** Props passed down to the root element */
    wrapperProps?: React.ComponentPropsWithoutRef<'div'> & DataAttributes;
    /** Icon inside the thumb of the switch */
    thumbIcon?: React.ReactNode;
    /** Position of the label relative to the input @default `'right'` */
    labelPosition?: 'left' | 'right';
    /** Description displayed below the label */
    description?: React.ReactNode;
    /** Error displayed below the label */
    error?: React.ReactNode;
    /** Assigns ref of the root element */
    rootRef?: React.ForwardedRef<HTMLDivElement>;
    /** If set, the indicator will be displayed inside thumb @default `true` */
    withThumbIndicator?: boolean;
}
export type SwitchFactory = Factory<{
    props: SwitchProps;
    ref: HTMLInputElement;
    stylesNames: SwitchStylesNames;
    vars: SwitchCssVariables;
    staticComponents: {
        Group: typeof SwitchGroup;
    };
}>;
export declare const Switch: import("../..").MantineComponent<{
    props: SwitchProps;
    ref: HTMLInputElement;
    stylesNames: SwitchStylesNames;
    vars: SwitchCssVariables;
    staticComponents: {
        Group: typeof SwitchGroup;
    };
}>;
