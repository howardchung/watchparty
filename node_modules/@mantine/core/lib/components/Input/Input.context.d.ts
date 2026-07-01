import { MantineSize } from '../../core';
interface InputContext {
    size: MantineSize | (string & {});
}
export declare const InputContext: ({ children, value }: {
    value: InputContext;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useInputContext: () => InputContext | null;
export {};
