export type Bep53Values = Array<number>;
export type Bep53Range = Array<string>;

export function compose(values: Bep53Values): Bep53Range;
export function parse(range: Bep53Range): Bep53Values;
