import { BoxProps, ElementProps, Factory, MantineColor, MantineRadius, MantineSize, MantineSpacing, StylesApiProps } from '../../core';
import { StepperCompleted } from './StepperCompleted/StepperCompleted';
import { StepperStep } from './StepperStep/StepperStep';
export type StepFragmentComponent = React.FC<{
    step: number;
}>;
export type StepperStylesNames = 'root' | 'separator' | 'steps' | 'content' | 'step' | 'stepLoader' | 'verticalSeparator' | 'stepWrapper' | 'stepIcon' | 'stepCompletedIcon' | 'stepBody' | 'stepLabel' | 'stepDescription';
export type StepperCssVariables = {
    root: '--stepper-color' | '--stepper-icon-color' | '--stepper-icon-size' | '--stepper-content-padding' | '--stepper-radius' | '--stepper-fz' | '--stepper-spacing';
};
export interface StepperProps extends BoxProps, StylesApiProps<StepperFactory>, ElementProps<'div'> {
    /** `Stepper.Step` components */
    children: React.ReactNode;
    /** Called when step is clicked */
    onStepClick?: (stepIndex: number) => void;
    /** Index of the active step */
    active: number;
    /** Step icon, default value is `step index + 1` */
    icon?: React.ReactNode | StepFragmentComponent;
    /** Step icon displayed when step is completed, check icon by default */
    completedIcon?: React.ReactNode | StepFragmentComponent;
    /** Step icon displayed when step is in progress, default value is `step index + 1` */
    progressIcon?: React.ReactNode | StepFragmentComponent;
    /** Key of `theme.colors` or any valid CSS color, controls colors of active and progress steps @default `theme.primaryColor` */
    color?: MantineColor;
    /** Controls size of the step icon, by default icon size is inferred from `size` prop */
    iconSize?: number | string;
    /** Key of `theme.spacing` or any valid CSS value to set `padding-top` of the content */
    contentPadding?: MantineSpacing;
    /** Stepper orientation @default `'horizontal'` */
    orientation?: 'vertical' | 'horizontal';
    /** Icon position relative to the step body @default `'left'` */
    iconPosition?: 'right' | 'left';
    /** Controls size of various Stepper elements */
    size?: MantineSize;
    /** Key of `theme.radius` or any valid CSS value to set steps border-radius @default `"xl"` */
    radius?: MantineRadius;
    /** If set, next steps can be selected @default `true` */
    allowNextStepsSelect?: boolean;
    /** Determines whether steps should wrap to the next line if no space is available @default `true` */
    wrap?: boolean;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
}
export type StepperFactory = Factory<{
    props: StepperProps;
    ref: HTMLDivElement;
    stylesNames: StepperStylesNames;
    vars: StepperCssVariables;
    staticComponents: {
        Step: typeof StepperStep;
        Completed: typeof StepperCompleted;
    };
}>;
export declare const Stepper: import("../..").MantineComponent<{
    props: StepperProps;
    ref: HTMLDivElement;
    stylesNames: StepperStylesNames;
    vars: StepperCssVariables;
    staticComponents: {
        Step: typeof StepperStep;
        Completed: typeof StepperCompleted;
    };
}>;
