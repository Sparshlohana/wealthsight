import { Colors, Tokens } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { View, ViewProps } from 'react-native';

export function Card({ style, children, ...rest }: ViewProps & { children?: React.ReactNode }) {
    const scheme = useColorScheme() ?? 'light';
    return (
        <View
            style={[
                {
                    padding: Tokens.spacing.lg,
                    borderRadius: Tokens.radius.lg,
                    backgroundColor: Colors[scheme].surface,
                    borderWidth: 1,
                    borderColor: Colors[scheme].border,
                },
                Tokens.shadow,
                style,
            ]}
            {...rest}
        >
            {children}
        </View>
    );
}
