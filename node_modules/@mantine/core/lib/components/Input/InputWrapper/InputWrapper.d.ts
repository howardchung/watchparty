import { BoxProps, DataAttributes, ElementProps, Factory, MantineFontSize, StylesApiProps } from '../../../core';
import { InputDescriptionCssVariables, InputDescriptionProps, InputDescriptionStylesNames } from '../InputDescription/InputDescription';
import { InputErrorCssVariables, InputErrorProps, InputErrorStylesNames } from '../InputError/InputError';
import { InputLabelCssVariables, InputLabelProps, InputLabelStylesNames } from '../InputLabel/InputLabel';
export type InputWrapperCssVariables = InputLabelCssVariables & InputErrorCssVariables & InputDescriptionCssVariables;
export type InputWrapperStylesNames = 'root' | InputLabelStylesNames | InputDescriptionStylesNames | InputErrorStylesNames;
export interface __InputWrapperProps {
    /** Contents of `Input.Label` component. If not set, label is not displayed. */
    label?: React.ReactNode;
    /** Contents of `Input.Description` component. If not set, description is not displayed. */
    description?: React.ReactNode;
    /** Contents of `Input.Error` component. If not set, error is not displayed. */
    error?: React.ReactNode;
    /** Adds required attribute to the input and a red asterisk on the right side of label @default `false` */
    required?: boolean;
    /** If set, the required asterisk is displayed next to the label. Overrides `required` prop. Does not add required attribute to the input. @default `false` */
    withAsterisk?: boolean;
    /** Props passed down to the `Input.Label` component */
    labelProps?: InputLabelProps & DataAttributes;
    /** Props passed down to the `Input.Description` component */
    descriptionProps?: InputDescriptionProps & DataAttributes;
    /** Props passed down to the `Input.Error` component */
    errorProps?: InputErrorProps & DataAttributes;
    /** Input container component @default `React.Fragment` */
    inputContainer?: (children: React.ReactNode) => React.ReactNode;
    /** Controls order of the elements @default `['label', 'description', 'input', 'error']` */
    inputWrapperOrder?: ('label' | 'input' | 'description' | 'error')[];
}
export interface InputWrapperProps extends __InputWrapperProps, BoxProps, StylesApiProps<InputWrapperFactory>, ElementProps<'div'> {
    __staticSelector?: string;
    /** Props passed to Styles API context, replaces Input.Wrapper props */
    __stylesApiProps?: Record<string, any>;
    /** Static id used as base to generate `aria-` attributes, by default generates random id */
    id?: string;
    /** Controls size of `Input.Label`, `Input.Description` and `Input.Error` components */
    size?: MantineFontSize;
    /** `Input.Label` root element, `'label'` by default */
    labelElement?: 'label' | 'div';
}
export type InputWrapperFactory = Factory<{
    props: InputWrapperProps;
    ref: HTMLDivElement;
    stylesNames: InputWrapperStylesNames;
    vars: InputWrapperCssVariables;
}>;
export declare const InputWrapper: import("../../..").MantineComponent<{
    props: InputWrapperProps;
    ref: HTMLDivElement;
    stylesNames: InputWrapperStylesNames;
    vars: InputWrapperCssVariables;
}>;
