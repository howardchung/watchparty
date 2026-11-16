import { DataAttributes, Factory, MantineSize } from '../../../core';
import { InputWrapperProps, InputWrapperStylesNames } from '../../Input';
export type SwitchGroupStylesNames = InputWrapperStylesNames;
export interface SwitchGroupProps extends Omit<InputWrapperProps, 'onChange'> {
    /** `Switch` components */
    children: React.ReactNode;
    /** Controlled component value */
    value?: string[];
    /** Default value for uncontrolled component */
    defaultValue?: string[];
    /** Called when value changes */
    onChange?: (value: string[]) => void;
    /** Props passed down to the `Input.Wrapper` */
    wrapperProps?: React.ComponentPropsWithoutRef<'div'> & DataAttributes;
    /** Controls size of the `Input.Wrapper` @default `'sm'` */
    size?: MantineSize | (string & {});
    /** If set, value cannot be changed */
    readOnly?: boolean;
    /** Sets `disabled` attribute, prevents interactions */
    disabled?: boolean;
}
export type SwitchGroupFactory = Factory<{
    props: SwitchGroupProps;
    ref: HTMLDivElement;
    stylesNames: SwitchGroupStylesNames;
}>;
export declare const SwitchGroup: import("../../..").MantineComponent<{
    props: SwitchGroupProps;
    ref: HTMLDivElement;
    stylesNames: SwitchGroupStylesNames;
}>;
