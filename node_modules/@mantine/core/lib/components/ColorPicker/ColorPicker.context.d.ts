import { GetStylesApi } from '../../core';
import type { ColorPickerFactory } from './ColorPicker';
interface ColorPickerContextValue {
    getStyles: GetStylesApi<ColorPickerFactory>;
    unstyled: boolean | undefined;
}
export declare const ColorPickerProvider: ({ children, value }: {
    value: ColorPickerContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useColorPickerContext: () => ColorPickerContextValue | null;
export {};
