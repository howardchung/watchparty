export declare function getSeiData(raw: DataView, startPos: number, endPos: number): DataView;
export declare function isCea608Sei(payloadType: number, payloadSize: number, sei: DataView, pos: number): boolean;
export declare function isCCType(type: number): boolean;
export declare function isNonEmptyCCData(ccData1: number, ccData2: number): boolean;
export declare function isSeiNalUnitType(unitType: number): boolean;
export declare function parseCta608DataFromSei(sei: DataView, fieldData: number[][]): void;
//# sourceMappingURL=seiHelpers.d.ts.map