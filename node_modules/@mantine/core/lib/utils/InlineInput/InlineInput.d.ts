import { BoxProps, ElementProps, Factory, MantineSize, StylesApiProps } from '../../core';
export declare const InlineInputClasses: any;
export type InlineInputStylesNames = 'root' | 'body' | 'labelWrapper' | 'label' | 'description' | 'error';
export interface InlineInputProps extends BoxProps, StylesApiProps<InlineInputFactory>, ElementProps<'div'> {
    __staticSelector: string;
    __stylesApiProps: Record<string, any>;
    label: React.ReactNode;
    description: React.ReactNode;
    id: string;
    disabled: boolean | undefined;
    error: React.ReactNode;
    size: MantineSize | (string & {}) | undefined;
    labelPosition?: 'left' | 'right';
    bodyElement?: any;
    labelElement?: any;
}
export type InlineInputFactory = Factory<{
    props: any;
    stylesNames: InlineInputStylesNames;
}>;
export declare const InlineInput: import("react").ForwardRefExoticComponent<InlineInputProps & import("react").RefAttributes<HTMLDivElement>>;
