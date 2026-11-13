import { DataAttributes, Factory, MantineSize } from '../../../core';
import { InputWrapperProps, InputWrapperStylesNames } from '../../Input';
export type RadioGroupStylesNames = InputWrapperStylesNames;
export interface RadioGroupProps extends Omit<InputWrapperProps, 'onChange' | 'value' | 'defaultValue'> {
    /** `Radio` components and any other elements */
    children: React.ReactNode;
    /** Controlled component value */
    value?: string | null;
    /** Uncontrolled component default value */
    defaultValue?: string | null;
    /** Called when value changes */
    onChange?: (value: string) => void;
    /** Props passed down to the `Input.Wrapper` */
    wrapperProps?: React.ComponentPropsWithoutRef<'div'> & DataAttributes;
    /** Controls size of the `Input.Wrapper` @default `'sm'` */
    size?: MantineSize;
    /** `name` attribute of child radio inputs. By default, `name` is generated randomly. */
    name?: string;
    /** If set, value cannot be changed */
    readOnly?: boolean;
    /** Sets `disabled` attribute, prevents interactions */
    disabled?: boolean;
}
export type RadioGroupFactory = Factory<{
    props: RadioGroupProps;
    ref: HTMLDivElement;
    stylesNames: RadioGroupStylesNames;
}>;
export declare const RadioGroup: import("../../..").MantineComponent<{
    props: RadioGroupProps;
    ref: HTMLDivElement;
    stylesNames: RadioGroupStylesNames;
}>;
