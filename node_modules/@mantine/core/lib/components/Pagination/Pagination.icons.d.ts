interface _PaginationIconProps extends React.ComponentPropsWithoutRef<'svg'> {
    path: string;
    stroke?: any;
}
export type PaginationIconProps = Omit<_PaginationIconProps, 'path'>;
export type PaginationIcon = React.FC<PaginationIconProps>;
export declare const PaginationNextIcon: (props: PaginationIconProps) => import("react/jsx-runtime").JSX.Element;
export declare const PaginationPreviousIcon: (props: PaginationIconProps) => import("react/jsx-runtime").JSX.Element;
export declare const PaginationFirstIcon: (props: PaginationIconProps) => import("react/jsx-runtime").JSX.Element;
export declare const PaginationLastIcon: (props: PaginationIconProps) => import("react/jsx-runtime").JSX.Element;
export declare const PaginationDotsIcon: (props: PaginationIconProps) => import("react/jsx-runtime").JSX.Element;
export {};
