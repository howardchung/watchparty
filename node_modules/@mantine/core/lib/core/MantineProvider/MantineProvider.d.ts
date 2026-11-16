import './baseline.css';
import './global.css';
import './default-css-variables.css';
import { MantineColorSchemeManager } from './color-scheme-managers';
import { MantineStylesTransform } from './Mantine.context';
import { CSSVariablesResolver } from './MantineCssVariables';
import type { MantineColorScheme, MantineThemeOverride } from './theme.types';
export interface MantineProviderProps {
    /** Theme override object */
    theme?: MantineThemeOverride;
    /** Used to retrieve/set color scheme value in external storage, by default uses `window.localStorage` */
    colorSchemeManager?: MantineColorSchemeManager;
    /** Default color scheme value used when `colorSchemeManager` cannot retrieve value from external storage, `light` by default */
    defaultColorScheme?: MantineColorScheme;
    /** Forces color scheme value, if set, MantineProvider ignores `colorSchemeManager` and `defaultColorScheme` */
    forceColorScheme?: 'light' | 'dark';
    /** CSS selector to which CSS variables should be added, by default variables are applied to `:root` and `:host` */
    cssVariablesSelector?: string;
    /** Determines whether theme CSS variables should be added to given `cssVariablesSelector` @default `true` */
    withCssVariables?: boolean;
    /** Determines whether CSS variables should be deduplicated: if CSS variable has the same value as in default theme, it is not added in the runtime. @default `true`. */
    deduplicateCssVariables?: boolean;
    /** Function to resolve root element to set `data-mantine-color-scheme` attribute, must return undefined on server, `() => document.documentElement` by default */
    getRootElement?: () => HTMLElement | undefined;
    /** A prefix for components static classes (for example {selector}-Text-root), `mantine` by default */
    classNamesPrefix?: string;
    /** Function to generate nonce attribute added to all generated `<style />` tags */
    getStyleNonce?: () => string;
    /** Function to generate CSS variables based on theme object */
    cssVariablesResolver?: CSSVariablesResolver;
    /** Determines whether components should have static classes, for example, `mantine-Button-root`. @default `true` */
    withStaticClasses?: boolean;
    /** Determines whether global classes should be added with `<style />` tag. Global classes are required for `hiddenFrom`/`visibleFrom` and `lightHidden`/`darkHidden` props to work. @default `true`. */
    withGlobalClasses?: boolean;
    /** An object to transform `styles` and `sx` props into css classes, can be used with CSS-in-JS libraries */
    stylesTransform?: MantineStylesTransform;
    /** Your application */
    children?: React.ReactNode;
    /** Environment at which the provider is used, `'test'` environment disables all transitions and portals */
    env?: 'default' | 'test';
}
export declare function MantineProvider({ theme, children, getStyleNonce, withStaticClasses, withGlobalClasses, deduplicateCssVariables, withCssVariables, cssVariablesSelector, classNamesPrefix, colorSchemeManager, defaultColorScheme, getRootElement, cssVariablesResolver, forceColorScheme, stylesTransform, env, }: MantineProviderProps): import("react/jsx-runtime").JSX.Element;
export declare namespace MantineProvider {
    var displayName: string;
}
export interface HeadlessMantineProviderProps {
    /** Theme override object */
    theme?: MantineThemeOverride;
    /** Your application */
    children?: React.ReactNode;
    /** Environment at which the provider is used, `'test'` environment disables all transitions and portals */
    env?: 'default' | 'test';
}
export declare function HeadlessMantineProvider({ children, theme, env }: HeadlessMantineProviderProps): import("react/jsx-runtime").JSX.Element;
export declare namespace HeadlessMantineProvider {
    var displayName: string;
}
