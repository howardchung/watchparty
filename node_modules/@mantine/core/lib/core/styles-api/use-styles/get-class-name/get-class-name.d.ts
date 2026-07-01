import { MantineTheme } from '../../../MantineProvider';
import { GetStylesApiOptions } from '../../styles-api.types';
type __ClassNames = undefined | Partial<Record<string, string>> | ((theme: MantineTheme, props: Record<string, any>, ctx: Record<string, any> | undefined) => Partial<Record<string, string>>);
export type _ClassNames = __ClassNames | __ClassNames[];
export interface GetClassNameOptions {
    /** Theme object, resolved by hook */
    theme: MantineTheme;
    /** Options for specified selector, may include `classNames` or `className` */
    options: GetStylesApiOptions | undefined;
    /** Name of the component which is used to get `classNames` from `theme.components` */
    themeName: string[];
    /** Class part specified in `getStyles` */
    selector: string;
    /** Prefix for all class names, resolved by hook, `mantine` by default */
    classNamesPrefix: string;
    /** `classNames` specified in the hook, only resolved `classNames[selector]` is added to the list */
    classNames: _ClassNames;
    /** Classes object, usually imported from `*.module.css` */
    classes: Record<string, string>;
    /** Determines whether classes from `classes` should be added to the list */
    unstyled: boolean | undefined;
    /** `className` specified in the hook, added to the list if `selector` is `rootSelector` */
    className: string | undefined;
    /** `rootSelector` specified in the hook, determines whether `className` should be added to the list */
    rootSelector: string;
    /** Component props, used as context for `classNames` and `options.classNames` */
    props: Record<string, any>;
    /** Component styles context, used as context for `classNames` and `options.classNames` */
    stylesCtx?: Record<string, any> | undefined;
    /** Determines whether static classes should be added */
    withStaticClasses?: boolean;
    /** If set, removes all Mantine classes */
    headless?: boolean;
    /** `styles` prop transformed into classes with CSS-in-JS library, for example, emotion */
    transformedStyles?: Record<string, string>[];
}
export declare function getClassName({ theme, options, themeName, selector, classNamesPrefix, classNames, classes, unstyled, className, rootSelector, props, stylesCtx, withStaticClasses, headless, transformedStyles, }: GetClassNameOptions): string;
export {};
