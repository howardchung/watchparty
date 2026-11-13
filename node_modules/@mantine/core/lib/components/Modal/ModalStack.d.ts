interface ModalStackContext {
    stack: string[];
    addModal: (id: string, zIndex: number | string) => void;
    removeModal: (id: string) => void;
    getZIndex: (id: string) => string;
    currentId: string;
    maxZIndex: string | number;
}
declare const useModalStackContext: () => ModalStackContext | null;
export { useModalStackContext };
export interface ModalStackProps {
    children: React.ReactNode;
}
export declare function ModalStack({ children }: ModalStackProps): import("react/jsx-runtime").JSX.Element;
export declare namespace ModalStack {
    var displayName: string;
}
