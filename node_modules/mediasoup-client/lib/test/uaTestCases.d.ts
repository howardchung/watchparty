import type { BuiltinHandlerName, NavigatorUAData } from '../Device';
type UATestCase = {
    desc: string;
    userAgent: string;
    userAgentData?: NavigatorUAData;
    expect?: BuiltinHandlerName;
};
export declare const uaTestCases: UATestCase[];
export {};
//# sourceMappingURL=uaTestCases.d.ts.map