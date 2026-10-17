import { BoxProps } from '../../../core';
import { PaginationIconProps } from '../Pagination.icons';
export interface CreateEdgeComponent {
    icon: React.FC<PaginationIconProps>;
    name: string;
    action: 'onNext' | 'onPrevious' | 'onFirst' | 'onLast';
    type: 'next' | 'previous';
}
export interface PaginationEdgeProps extends BoxProps {
    /** An icon component to replace the default icon */
    icon?: React.FC<PaginationIconProps>;
}
export declare function createEdgeComponent({ icon, name, action, type }: CreateEdgeComponent): (<C = "button">(props: import("../../..").PolymorphicComponentProps<C, PaginationEdgeProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(PaginationEdgeProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof PaginationEdgeProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (PaginationEdgeProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & Record<string, never>;
export declare const PaginationNext: (<C = "button">(props: import("../../..").PolymorphicComponentProps<C, PaginationEdgeProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(PaginationEdgeProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof PaginationEdgeProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (PaginationEdgeProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & Record<string, never>;
export declare const PaginationPrevious: (<C = "button">(props: import("../../..").PolymorphicComponentProps<C, PaginationEdgeProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(PaginationEdgeProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof PaginationEdgeProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (PaginationEdgeProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & Record<string, never>;
export declare const PaginationFirst: (<C = "button">(props: import("../../..").PolymorphicComponentProps<C, PaginationEdgeProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(PaginationEdgeProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof PaginationEdgeProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (PaginationEdgeProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & Record<string, never>;
export declare const PaginationLast: (<C = "button">(props: import("../../..").PolymorphicComponentProps<C, PaginationEdgeProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(PaginationEdgeProps & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof PaginationEdgeProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (PaginationEdgeProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & Record<string, never>;
