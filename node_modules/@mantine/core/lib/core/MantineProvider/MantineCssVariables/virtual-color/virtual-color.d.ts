import { MantineColor, MantineColorsTuple } from '../../theme.types';
interface VirtualColorInput {
    dark: MantineColor;
    light: MantineColor;
    name: string;
}
type VirtualColor = MantineColorsTuple & {
    'mantine-virtual-color': true;
    name: string;
    dark: MantineColor;
    light: MantineColor;
};
export declare function virtualColor(input: VirtualColorInput): MantineColorsTuple;
export declare function isVirtualColor(value: unknown): value is VirtualColor;
export {};
