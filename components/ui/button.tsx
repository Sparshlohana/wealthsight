import { Colors, Tokens } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getFontSize, getSpacing } from '@/utils/responsive';
import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';

type ButtonProps = {
    title: string;
    onPress?: () => void;
    style?: ViewStyle | ViewStyle[];
    variant?: 'primary' | 'soft';
};

export function AppButton({ title, onPress, style, variant = 'primary' }: ButtonProps) {
    const scheme = useColorScheme() ?? 'light';
    const isPrimary = variant === 'primary';
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                {
                    paddingVertical: getSpacing(11, 12, Tokens.spacing.md),
                    paddingHorizontal: getSpacing(16, 18, Tokens.spacing.xl),
                    borderRadius: Tokens.radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isPrimary
                        ? Colors[scheme].tint
                        : scheme === 'dark'
                            ? '#1C2226'
                            : '#E6F4FB',
                    opacity: pressed ? 0.85 : 1,
                    borderWidth: isPrimary ? 0 : 1,
                    borderColor: isPrimary ? 'transparent' : Colors[scheme].border,
                },
                style as any,
            ]}
        >
            <Text
                style={{
                    color: isPrimary ? 'white' : Colors[scheme].tint,
                    fontWeight: '700',
                    fontSize: getFontSize(14, 15, 16),
                }}
            >
                {title}
            </Text>
        </Pressable>
    );
}
