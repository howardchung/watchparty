export interface CheckboxIconProps extends React.ComponentPropsWithoutRef<'svg'> {
    indeterminate: boolean | undefined;
}
export interface CheckIconProps extends React.ComponentPropsWithoutRef<'svg'> {
    size?: number | string;
}
export declare function CheckIcon({ size, style, ...others }: CheckIconProps): import("react/jsx-runtime").JSX.Element;
export declare function CheckboxIcon({ indeterminate, ...others }: CheckboxIconProps): import("react/jsx-runtime").JSX.Element;
