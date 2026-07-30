import { MantineTheme } from '../../../../MantineProvider';
interface GetThemeStylesOptions {
    theme: MantineTheme;
    themeName: string[];
    props: Record<string, any>;
    stylesCtx: Record<string, any> | undefined;
    selector: string;
}
export declare function getThemeStyles({ theme, themeName, props, stylesCtx, selector, }: GetThemeStylesOptions): any;
export {};
