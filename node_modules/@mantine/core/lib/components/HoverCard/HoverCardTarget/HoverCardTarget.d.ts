import { PopoverTargetProps } from '../../Popover';
export interface HoverCardTargetProps extends PopoverTargetProps {
    /** Key of the prop used to pass event listeners, by default event listeners are passed directly to component */
    eventPropsWrapperName?: string;
}
export declare const HoverCardTarget: import("react").ForwardRefExoticComponent<HoverCardTargetProps & import("react").RefAttributes<HTMLElement>>;
