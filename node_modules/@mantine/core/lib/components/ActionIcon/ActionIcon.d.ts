import { BoxProps, MantineColor, MantineGradient, MantineRadius, MantineSize, PolymorphicFactory, StylesApiProps } from '../../core';
import { LoaderProps } from '../Loader';
import { ActionIconGroup } from './ActionIconGroup/ActionIconGroup';
import { ActionIconGroupSection } from './ActionIconGroupSection/ActionIconGroupSection';
export type ActionIconVariant = 'filled' | 'light' | 'outline' | 'transparent' | 'white' | 'subtle' | 'default' | 'gradient';
export type ActionIconStylesNames = 'root' | 'loader' | 'icon';
export type ActionIconCssVariables = {
    root: '--ai-radius' | '--ai-size' | '--ai-bg' | '--ai-hover' | '--ai-hover-color' | '--ai-color' | '--ai-bd';
};
export interface ActionIconProps extends BoxProps, StylesApiProps<ActionIconFactory> {
    'data-disabled'?: boolean;
    __staticSelector?: string;
    /** If set, `Loader` component is displayed instead of the `children` */
    loading?: boolean;
    /** Props passed down to the `Loader` component. Ignored when `loading` prop is not set. */
    loaderProps?: LoaderProps;
    /** Controls width and height of the button. Numbers are converted to rem. @default `'md'`. */
    size?: MantineSize | `input-${MantineSize}` | (string & {}) | number;
    /** Key of `theme.colors` or any valid CSS color. @default `theme.primaryColor`. */
    color?: MantineColor;
    /** Key of `theme.radius` or any valid CSS value to set border-radius. Numbers are converted to rem. @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Gradient values used with `variant="gradient"`. @default `theme.defaultGradient`. */
    gradient?: MantineGradient;
    /** Sets `disabled` attribute, prevents interactions */
    disabled?: boolean;
    /** Icon element */
    children?: React.ReactNode;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
}
export type ActionIconFactory = PolymorphicFactory<{
    props: ActionIconProps;
    defaultComponent: 'button';
    defaultRef: HTMLButtonElement;
    stylesNames: ActionIconStylesNames;
    variant: ActionIconVariant;
    vars: ActionIconCssVariables;
    staticComponents: {
        Group: typeof ActionIconGroup;
        GroupSection: typeof ActionIconGroupSection;
    };
}>;
export declare const ActionIcon: (<C = "button">(props: import("../..").PolymorphicComponentProps<C, ActionIconProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(ActionIconProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof ActionIconProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (ActionIconProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: ActionIconProps;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
    stylesNames: ActionIconStylesNames;
    variant: ActionIconVariant;
    vars: ActionIconCssVariables;
    staticComponents: {
        Group: typeof ActionIconGroup;
        GroupSection: typeof ActionIconGroupSection;
    };
}> & import("../../core/factory/factory").ComponentClasses<{
    props: ActionIconProps;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
    stylesNames: ActionIconStylesNames;
    variant: ActionIconVariant;
    vars: ActionIconCssVariables;
    staticComponents: {
        Group: typeof ActionIconGroup;
        GroupSection: typeof ActionIconGroupSection;
    };
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: ActionIconProps;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
    stylesNames: ActionIconStylesNames;
    variant: ActionIconVariant;
    vars: ActionIconCssVariables;
    staticComponents: {
        Group: typeof ActionIconGroup;
        GroupSection: typeof ActionIconGroupSection;
    };
}> & {
    Group: typeof ActionIconGroup;
    GroupSection: typeof ActionIconGroupSection;
};
