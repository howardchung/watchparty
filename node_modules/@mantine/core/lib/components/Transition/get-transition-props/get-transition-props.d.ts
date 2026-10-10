import type { SetRequired } from 'type-fest';
import type { TransitionOverride } from '../Transition';
type MinimalTransitionOverride = SetRequired<TransitionOverride, 'duration' | 'transition'>;
export declare function getTransitionProps(transitionProps: TransitionOverride | undefined, componentTransition: TransitionOverride | undefined): MinimalTransitionOverride;
export {};
