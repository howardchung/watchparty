import { BoxProps, ElementProps } from '../../core';
import { __CloseButtonProps } from '../CloseButton';
export interface ModalBaseCloseButtonProps extends __CloseButtonProps, BoxProps, ElementProps<'button'> {
}
export declare const ModalBaseCloseButton: import("react").ForwardRefExoticComponent<ModalBaseCloseButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
