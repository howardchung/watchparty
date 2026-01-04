import { MantineColorScheme } from '../theme.types';
export declare function useMantineColorScheme({ keepTransitions }?: {
    keepTransitions?: boolean;
}): {
    colorScheme: MantineColorScheme;
    setColorScheme: (value: MantineColorScheme) => void;
    clearColorScheme: () => void;
    toggleColorScheme: () => void;
};
