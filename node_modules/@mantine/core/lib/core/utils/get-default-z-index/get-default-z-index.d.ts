declare const elevations: {
    readonly app: 100;
    readonly modal: 200;
    readonly popover: 300;
    readonly overlay: 400;
    readonly max: 9999;
};
export declare function getDefaultZIndex(level: keyof typeof elevations): 100 | 200 | 300 | 400 | 9999;
export {};
