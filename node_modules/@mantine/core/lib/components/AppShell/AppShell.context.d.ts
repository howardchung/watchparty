import { GetStylesApi } from '../../core';
import type { AppShellFactory } from './AppShell';
export interface AppShellContext {
    getStyles: GetStylesApi<AppShellFactory>;
    withBorder: boolean | undefined;
    zIndex: string | number | undefined;
    disabled: boolean | undefined;
    offsetScrollbars: boolean | undefined;
}
export declare const AppShellProvider: ({ children, value }: {
    value: AppShellContext;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useAppShellContext: () => AppShellContext;
