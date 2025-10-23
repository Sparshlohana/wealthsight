import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;

/**
 * Get responsive font size based on screen width
 * @param small - Font size for small devices (< 375px)
 * @param medium - Font size for medium devices (375px - 414px)
 * @param large - Font size for large devices (>= 414px)
 */
export const getFontSize = (small: number, medium: number, large: number) => {
    if (isSmallDevice) return small;
    if (isMediumDevice) return medium;
    return large;
};

/**
 * Get responsive spacing based on screen width
 * @param small - Spacing for small devices (< 375px)
 * @param medium - Spacing for medium devices (375px - 414px)
 * @param large - Spacing for large devices (>= 414px)
 */
export const getSpacing = (small: number, medium: number, large: number) => {
    if (isSmallDevice) return small;
    if (isMediumDevice) return medium;
    return large;
};

/**
 * Get responsive value based on screen width
 * @param small - Value for small devices (< 375px)
 * @param medium - Value for medium devices (375px - 414px)
 * @param large - Value for large devices (>= 414px)
 */
export const getResponsiveValue = <T,>(small: T, medium: T, large: T): T => {
    if (isSmallDevice) return small;
    if (isMediumDevice) return medium;
    return large;
};
