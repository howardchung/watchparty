import type { AppShellProps } from '../AppShell';
interface AppShellMediaStylesProps {
    navbar: AppShellProps['navbar'] | undefined;
    header: AppShellProps['header'] | undefined;
    aside: AppShellProps['aside'] | undefined;
    footer: AppShellProps['footer'] | undefined;
    padding: AppShellProps['padding'] | undefined;
}
export declare function AppShellMediaStyles({ navbar, header, aside, footer, padding, }: AppShellMediaStylesProps): import("react/jsx-runtime").JSX.Element;
export {};
