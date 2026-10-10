export type Direction = 'ltr' | 'rtl';
export interface DirectionContextValue {
    dir: Direction;
    toggleDirection: () => void;
    setDirection: (dir: Direction) => void;
}
export declare const DirectionContext: import("react").Context<DirectionContextValue>;
export declare function useDirection(): DirectionContextValue;
export interface DirectionProviderProps {
    /** Your application */
    children: React.ReactNode;
    /** Direction set as a default value, `ltr` by default */
    initialDirection?: Direction;
    /** Determines whether direction should be updated on mount based on `dir` attribute set on root element (usually html element) @default `true`  */
    detectDirection?: boolean;
}
export declare function DirectionProvider({ children, initialDirection, detectDirection, }: DirectionProviderProps): import("react/jsx-runtime").JSX.Element;
