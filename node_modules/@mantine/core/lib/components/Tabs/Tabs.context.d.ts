import { GetStylesApi } from '../../core';
import type { TabsFactory } from './Tabs';
export interface TabsContextValue {
    id: string;
    value: string | null;
    orientation: 'horizontal' | 'vertical' | undefined;
    loop: boolean | undefined;
    activateTabWithKeyboard: boolean | undefined;
    allowTabDeactivation: boolean | undefined;
    onChange: (value: string | null) => void;
    getTabId: (value: string) => string;
    getPanelId: (value: string) => string;
    variant: string | undefined;
    color: string | undefined;
    radius: string | number | undefined;
    inverted: boolean | undefined;
    keepMounted: boolean | undefined;
    placement: 'right' | 'left' | undefined;
    unstyled: boolean | undefined;
    getStyles: GetStylesApi<TabsFactory>;
}
export declare const TabsProvider: ({ children, value }: {
    value: TabsContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useTabsContext: () => TabsContextValue;
