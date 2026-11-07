import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
import { __BaseInputProps, __InputStylesNames, InputVariant } from '../Input';
export interface FileInputProps<Multiple = false> extends BoxProps, __BaseInputProps, StylesApiProps<FileInputFactory>, ElementProps<'button', 'value' | 'defaultValue' | 'onChange' | 'placeholder'> {
    component?: any;
    /** Called when value changes */
    onChange?: (payload: Multiple extends true ? File[] : File | null) => void;
    /** Controlled component value */
    value?: Multiple extends true ? File[] : File | null;
    /** Uncontrolled component default value */
    defaultValue?: Multiple extends true ? File[] : File | null;
    /** If set, user can pick more than one file @default `false` */
    multiple?: Multiple;
    /** File input accept attribute, for example, `"image/png,image/jpeg"` */
    accept?: string;
    /** Input name attribute */
    name?: string;
    /** Input form attribute */
    form?: string;
    /** Value renderer. By default, displays file name. */
    valueComponent?: React.FC<{
        value: null | File | File[];
    }>;
    /** If set, the clear button is displayed in the right section @default `false` */
    clearable?: boolean;
    /** Props passed down to the clear button */
    clearButtonProps?: React.ComponentPropsWithoutRef<'button'>;
    /** If set, the input value cannot be changed  */
    readOnly?: boolean;
    /** Specifies that, optionally, a new file should be captured, and which device should be used to capture that new media of a type defined by the accept attribute. */
    capture?: boolean | 'user' | 'environment';
    /** Props passed down to the hidden input element which is used to capture files */
    fileInputProps?: React.ComponentPropsWithoutRef<'input'>;
    /** Input placeholder */
    placeholder?: React.ReactNode;
    /** Reference of the function that should be called when value changes to null or empty array */
    resetRef?: React.ForwardedRef<() => void>;
}
export type FileInputFactory = Factory<{
    props: FileInputProps;
    ref: HTMLButtonElement;
    stylesNames: __InputStylesNames | 'placeholder';
    variant: InputVariant;
}>;
declare const _FileInput: import("../..").MantineComponent<{
    props: FileInputProps;
    ref: HTMLButtonElement;
    stylesNames: __InputStylesNames | "placeholder";
    variant: InputVariant;
}>;
type FileInputComponent = (<Multiple extends boolean = false>(props: FileInputProps<Multiple> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
}) => React.JSX.Element) & {
    extend: typeof _FileInput.extend;
};
export declare const FileInput: FileInputComponent;
export {};
