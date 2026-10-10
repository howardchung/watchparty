import type { GridColProps } from './GridCol';
interface GridColVariablesProps {
    selector: string;
    span: GridColProps['span'] | undefined;
    order?: GridColProps['order'] | undefined;
    offset?: GridColProps['offset'] | undefined;
}
export declare function GridColVariables({ span, order, offset, selector }: GridColVariablesProps): import("react/jsx-runtime").JSX.Element;
export {};
