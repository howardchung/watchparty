import { BoxProps, DataAttributes, PolymorphicFactory, StylesApiProps } from '../../core';
import { __BaseInputProps, __InputStylesNames, InputVariant } from '../Input';
export interface InputBaseProps extends BoxProps, __BaseInputProps, StylesApiProps<InputBaseFactory> {
    __staticSelector?: string;
    __stylesApiProps?: Record<string, any>;
    /** Props passed down to the root element (`Input.Wrapper` component) */
    wrapperProps?: React.ComponentPropsWithoutRef<'div'> & DataAttributes;
    /** If set, the input can have multiple lines, for example when `component="textarea"` @default `false` */
    multiline?: boolean;
    /** If set, `aria-` and other accessibility attributes are added to the input @default `true` */
    withAria?: boolean;
}
export type InputBaseFactory = PolymorphicFactory<{
    props: InputBaseProps;
    defaultRef: HTMLInputElement;
    defaultComponent: 'input';
    stylesNames: __InputStylesNames;
    variant: InputVariant;
}>;
export declare const InputBase: (<C = "input">(props: import("../..").PolymorphicComponentProps<C, InputBaseProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(InputBaseProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof InputBaseProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (InputBaseProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("../../core/factory/factory").ThemeExtend<{
    props: InputBaseProps;
    defaultRef: HTMLInputElement;
    defaultComponent: "input";
    stylesNames: __InputStylesNames;
    variant: InputVariant;
}> & import("../../core/factory/factory").ComponentClasses<{
    props: InputBaseProps;
    defaultRef: HTMLInputElement;
    defaultComponent: "input";
    stylesNames: __InputStylesNames;
    variant: InputVariant;
}> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
    props: InputBaseProps;
    defaultRef: HTMLInputElement;
    defaultComponent: "input";
    stylesNames: __InputStylesNames;
    variant: InputVariant;
}> & Record<string, never>;
