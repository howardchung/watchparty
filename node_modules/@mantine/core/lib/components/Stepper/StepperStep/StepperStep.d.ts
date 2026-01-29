import { BoxProps, CompoundStylesApiProps, ElementProps, Factory, MantineColor } from '../../../core';
import type { StepFragmentComponent } from '../Stepper';
export type StepperStepStylesNames = 'step' | 'stepLoader' | 'verticalSeparator' | 'stepWrapper' | 'stepIcon' | 'stepCompletedIcon' | 'stepBody' | 'stepLabel' | 'stepDescription';
export interface StepperStepProps extends BoxProps, CompoundStylesApiProps<StepperStepFactory>, ElementProps<'button'> {
    /** Step index, controlled by Stepper component */
    step?: number;
    /** Step state, controlled by Stepper component */
    state?: 'stepInactive' | 'stepProgress' | 'stepCompleted';
    /** Key of `theme.colors`, by default controlled by Stepper component */
    color?: MantineColor;
    /** Determines whether the icon should be displayed */
    withIcon?: boolean;
    /** Step icon, defaults to `step index + 1` when rendered within Stepper */
    icon?: React.ReactNode | StepFragmentComponent;
    /** Step icon displayed when step is completed */
    completedIcon?: React.ReactNode | StepFragmentComponent;
    /** Step icon displayed when step is in progress */
    progressIcon?: React.ReactNode | StepFragmentComponent;
    /** Step label, render after icon */
    label?: React.ReactNode | StepFragmentComponent;
    /** Step description */
    description?: React.ReactNode | StepFragmentComponent;
    /** Icon wrapper size */
    iconSize?: string | number;
    /** Icon position relative to step body, controlled by Stepper component */
    iconPosition?: 'right' | 'left';
    /** Indicates loading state of the step */
    loading?: boolean;
    /** Set to false to disable clicks on step */
    allowStepClick?: boolean;
    /** Should step selection be allowed */
    allowStepSelect?: boolean;
    /** Static selector base */
    __staticSelector?: string;
    /** Component orientation */
    orientation?: 'vertical' | 'horizontal';
}
export type StepperStepFactory = Factory<{
    props: StepperStepProps;
    ref: HTMLButtonElement;
    stylesNames: StepperStepStylesNames;
    compound: true;
}>;
export declare const StepperStep: import("../../..").MantineComponent<{
    props: StepperStepProps;
    ref: HTMLButtonElement;
    stylesNames: StepperStepStylesNames;
    compound: true;
}>;
