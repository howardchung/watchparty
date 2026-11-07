export declare function useModalContentProps(): {
    focusTrapActive: boolean | undefined;
    contentProps: {
        component: "section";
        onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
        role: "dialog";
        tabIndex: number;
        'aria-modal': boolean;
        'aria-describedby': string | undefined;
        'aria-labelledby': string | undefined;
    };
};
