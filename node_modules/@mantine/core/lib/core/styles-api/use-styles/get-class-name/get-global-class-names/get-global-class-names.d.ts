import { MantineTheme } from '../../../../MantineProvider';
import { GetStylesApiOptions } from '../../../styles-api.types';
interface GetGlobalClassNamesOptions {
    theme: MantineTheme;
    unstyled: boolean | undefined;
    options: GetStylesApiOptions | undefined;
}
export declare const FOCUS_CLASS_NAMES: {
    readonly always: "mantine-focus-always";
    readonly auto: "mantine-focus-auto";
    readonly never: "mantine-focus-never";
};
/** Returns classes that are defined globally (focus and active styles) based on options */
export declare function getGlobalClassNames({ theme, options, unstyled }: GetGlobalClassNamesOptions): string;
export {};
