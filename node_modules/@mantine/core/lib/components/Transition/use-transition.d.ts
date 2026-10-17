export type TransitionStatus = 'entered' | 'exited' | 'entering' | 'exiting' | 'pre-exiting' | 'pre-entering';
interface UseTransition {
    duration: number;
    exitDuration: number;
    timingFunction: string;
    mounted: boolean;
    onEnter?: () => void;
    onExit?: () => void;
    onEntered?: () => void;
    onExited?: () => void;
    enterDelay?: number;
    exitDelay?: number;
}
export declare function useTransition({ duration, exitDuration, timingFunction, mounted, onEnter, onExit, onEntered, onExited, enterDelay, exitDelay, }: UseTransition): {
    transitionDuration: number;
    transitionStatus: TransitionStatus;
    transitionTimingFunction: string;
};
export {};
