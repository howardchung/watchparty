export interface FileButtonProps<Multiple extends boolean = false> {
    /** Called when files are picked */
    onChange: (payload: Multiple extends true ? File[] : File | null) => void;
    /** Function that receives button props and returns react node that should be rendered */
    children: (props: {
        onClick: () => void;
    }) => React.ReactNode;
    /** If set, user can pick more than one file */
    multiple?: Multiple;
    /** File input accept attribute, for example, `"image/png,image/jpeg"` */
    accept?: string;
    /** Input name attribute */
    name?: string;
    /** Input form attribute */
    form?: string;
    /** Reference of the function that should be called when value changes to null or empty array */
    resetRef?: React.ForwardedRef<() => void>;
    /** Disables file picker */
    disabled?: boolean;
    /** Specifies that, optionally, a new file should be captured, and which device should be used to capture that new media of a type defined by the accept attribute. */
    capture?: boolean | 'user' | 'environment';
    /** Passes down props to the input element used to capture files */
    inputProps?: React.ComponentPropsWithoutRef<'input'>;
}
type FileButtonComponent = (<Multiple extends boolean = false>(props: FileButtonProps<Multiple>) => React.ReactElement) & {
    displayName?: string;
};
export declare const FileButton: FileButtonComponent;
export {};
