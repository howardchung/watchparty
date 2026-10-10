interface GetStaticClassNamesInput {
    themeName: string[];
    selector: string;
    classNamesPrefix: string;
    withStaticClass?: boolean;
}
/** Returns static component classes, for example, `.mantine-Input-wrapper` */
export declare function getStaticClassNames({ themeName, classNamesPrefix, selector, withStaticClass, }: GetStaticClassNamesInput): string[];
export {};
