import { GetStylesApi } from '../../core';
import type { CardFactory } from './Card';
interface CardContextValue {
    getStyles: GetStylesApi<CardFactory>;
}
export declare const CardProvider: ({ children, value }: {
    value: CardContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useCardContext: () => CardContextValue;
export {};
