export interface ScrollbarContextValue {
    hasThumb: boolean;
    scrollbar: HTMLDivElement | null;
    onThumbChange: (thumb: HTMLDivElement | null) => void;
    onThumbPointerUp: () => void;
    onThumbPointerDown: (pointerPos: {
        x: number;
        y: number;
    }) => void;
    onThumbPositionChange: () => void;
}
export declare const ScrollbarProvider: ({ children, value }: {
    value: ScrollbarContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useScrollbarContext: () => ScrollbarContextValue;
