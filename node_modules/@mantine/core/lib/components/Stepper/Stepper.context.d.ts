import { GetStylesApi } from '../../core';
import type { StepperFactory } from './Stepper';
interface StepperContextValue {
    getStyles: GetStylesApi<StepperFactory>;
    orientation: 'horizontal' | 'vertical' | undefined;
    iconPosition: 'left' | 'right' | undefined;
}
export declare const StepperProvider: ({ children, value }: {
    value: StepperContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useStepperContext: () => StepperContextValue;
export {};
