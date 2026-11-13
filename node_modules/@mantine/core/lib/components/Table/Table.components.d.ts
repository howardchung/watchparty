import { BoxProps, CompoundStylesApiProps, ElementProps, Factory, FactoryPayload } from '../../core';
import type { TableFactory } from './Table';
export interface TableElementProps<Selector extends string> extends BoxProps, CompoundStylesApiProps<Omit<TableFactory, 'stylesNames'> & {
    stylesNames: Selector;
}> {
}
export interface TableThProps extends TableElementProps<'th'>, ElementProps<'th'> {
}
export interface TableTdProps extends TableElementProps<'td'>, ElementProps<'td'> {
}
export interface TableTrProps extends TableElementProps<'tr'>, ElementProps<'tr'> {
}
export interface TableTheadProps extends TableElementProps<'thead'>, ElementProps<'thead'> {
}
export interface TableTbodyProps extends TableElementProps<'tbody'>, ElementProps<'tbody'> {
}
export interface TableTfootProps extends TableElementProps<'tfoot'>, ElementProps<'tfoot'> {
}
export interface TableCaptionProps extends TableElementProps<'caption'>, ElementProps<'caption'> {
}
export type TableThFactory = Factory<{
    props: TableThProps;
    ref: HTMLTableCellElement;
    stylesNames: 'th';
    compound: true;
}>;
export type TableTdFactory = Factory<{
    props: TableTdProps;
    ref: HTMLTableCellElement;
    stylesNames: 'td';
    compound: true;
}>;
export type TableTrFactory = Factory<{
    props: TableTrProps;
    ref: HTMLTableRowElement;
    stylesNames: 'tr';
    compound: true;
}>;
export type TableTheadFactory = Factory<{
    props: TableTheadProps;
    ref: HTMLTableSectionElement;
    stylesNames: 'thead';
    compound: true;
}>;
export type TableTbodyFactory = Factory<{
    props: TableTbodyProps;
    ref: HTMLTableSectionElement;
    stylesNames: 'tbody';
    compound: true;
}>;
export type TableTfootFactory = Factory<{
    props: TableTfootProps;
    ref: HTMLTableSectionElement;
    stylesNames: 'tfoot';
    compound: true;
}>;
export type TableCaptionFactory = Factory<{
    props: TableCaptionProps;
    ref: HTMLTableCaptionElement;
    stylesNames: 'caption';
    compound: true;
}>;
interface TableElementOptions {
    columnBorder?: true;
    rowBorder?: true;
    striped?: true;
    highlightOnHover?: true;
    captionSide?: true;
    stickyHeader?: true;
}
export declare function tableElement<Factory extends FactoryPayload>(element: 'th' | 'td' | 'tr' | 'thead' | 'tbody' | 'tfoot' | 'caption', options?: TableElementOptions): import("../..").MantineComponent<Factory>;
export declare const TableTh: import("../..").MantineComponent<{
    props: TableThProps;
    ref: HTMLTableCellElement;
    stylesNames: "th";
    compound: true;
}>;
export declare const TableTd: import("../..").MantineComponent<{
    props: TableTdProps;
    ref: HTMLTableCellElement;
    stylesNames: "td";
    compound: true;
}>;
export declare const TableTr: import("../..").MantineComponent<{
    props: TableTrProps;
    ref: HTMLTableRowElement;
    stylesNames: "tr";
    compound: true;
}>;
export declare const TableThead: import("../..").MantineComponent<{
    props: TableTheadProps;
    ref: HTMLTableSectionElement;
    stylesNames: "thead";
    compound: true;
}>;
export declare const TableTbody: import("../..").MantineComponent<{
    props: TableTbodyProps;
    ref: HTMLTableSectionElement;
    stylesNames: "tbody";
    compound: true;
}>;
export declare const TableTfoot: import("../..").MantineComponent<{
    props: TableTfootProps;
    ref: HTMLTableSectionElement;
    stylesNames: "tfoot";
    compound: true;
}>;
export declare const TableCaption: import("../..").MantineComponent<{
    props: TableCaptionProps;
    ref: HTMLTableCaptionElement;
    stylesNames: "caption";
    compound: true;
}>;
export {};
