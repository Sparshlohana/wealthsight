import { useAppTheme } from '@/contexts/ThemeContext';

// Override the default to use app theme preference stored in AsyncStorage
export function useColorScheme(): 'light' | 'dark' {
    const { theme } = useAppTheme();
    return theme;
}
