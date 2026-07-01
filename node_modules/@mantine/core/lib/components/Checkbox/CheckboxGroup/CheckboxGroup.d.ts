import { DataAttributes, Factory, MantineSize } from '../../../core';
import { InputWrapperProps, InputWrapperStylesNames } from '../../Input';
export type CheckboxGroupStylesNames = InputWrapperStylesNames;
export interface CheckboxGroupProps extends Omit<InputWrapperProps, 'onChange'> {
    /** `Checkbox` components and any other elements */
    children: React.ReactNode;
    /** Controlled component value */
    value?: string[];
    /** Default value for uncontrolled component */
    defaultValue?: string[];
    /** Called with an array of selected checkboxes values when value changes */
    onChange?: (value: string[]) => void;
    /** Props passed down to the root element (`Input.Wrapper` component) */
    wrapperProps?: React.ComponentPropsWithoutRef<'div'> & DataAttributes;
    /** Controls size of the `Input.Wrapper` @default `'sm'` */
    size?: MantineSize | (string & {});
    /** If set, value cannot be changed */
    readOnly?: boolean;
    /** Sets `disabled` attribute, prevents interactions */
    disabled?: boolean;
}
export type CheckboxGroupFactory = Factory<{
    props: CheckboxGroupProps;
    ref: HTMLDivElement;
    stylesNames: CheckboxGroupStylesNames;
}>;
export declare const CheckboxGroup: import("../../..").MantineComponent<{
    props: CheckboxGroupProps;
    ref: HTMLDivElement;
    stylesNames: CheckboxGroupStylesNames;
}>;
