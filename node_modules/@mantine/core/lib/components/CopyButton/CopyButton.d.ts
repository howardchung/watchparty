export interface CopyButtonProps {
    /** Children callback, provides current status and copy function as an argument */
    children: (payload: {
        copied: boolean;
        copy: () => void;
    }) => React.ReactNode;
    /** Value that is copied to the clipboard when the button is clicked */
    value: string;
    /** Copied status timeout in ms @default `1000` */
    timeout?: number;
}
export declare function CopyButton(props: CopyButtonProps): import("react/jsx-runtime").JSX.Element;
export declare namespace CopyButton {
    var displayName: string;
}
