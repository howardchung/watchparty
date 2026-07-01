interface DrawerStackContext {
    stack: string[];
    addModal: (id: string, zIndex: number | string) => void;
    removeModal: (id: string) => void;
    getZIndex: (id: string) => string;
    currentId: string;
    maxZIndex: string | number;
}
declare const useDrawerStackContext: () => DrawerStackContext | null;
export { useDrawerStackContext };
export interface DrawerStackProps {
    children: React.ReactNode;
}
export declare function DrawerStack({ children }: DrawerStackProps): import("react/jsx-runtime").JSX.Element;
export declare namespace DrawerStack {
    var displayName: string;
}
