import { Colors, Tokens } from '@/constants/theme';
import { useCategories } from '@/contexts/CategoriesContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Transaction } from '@/types/finance';
import { getFontSize, getSpacing } from '@/utils/responsive';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const TransactionItem: React.FC<{ tx: Transaction; onPress?: () => void; onLongPress?: () => void }> = ({ tx, onPress, onLongPress }) => {
    const textColor = useThemeColor({}, 'text');
    const scheme = useColorScheme() ?? 'light';
    const { categories } = useCategories();
    const cat = categories.find((c) => c.id === tx.category);
    const amountColor = tx.type === 'income' ? Colors[scheme].success : Colors[scheme].danger;
    const cardBg = scheme === 'dark' ? '#1A1D1F' : '#FFFFFF';
    const borderColor = scheme === 'dark' ? '#2A2D2F' : Colors[scheme].border;
    const title = tx.description || tx.merchant || (tx.type === 'income' ? 'Income' : 'Expense');

    const avatarSize = getSpacing(38, 41, 44);

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            style={[styles.row, {
                backgroundColor: cardBg,
                borderColor,
                borderWidth: 1,
                paddingVertical: getSpacing(11, 12, 14),
                paddingHorizontal: getSpacing(11, 12, 14),
            }]}
        >
            <View style={[styles.avatarWrap, { paddingRight: getSpacing(10, 11, 12) }]}>
                <View
                    style={[
                        styles.avatar,
                        {
                            backgroundColor: cat?.color ?? (scheme === 'dark' ? '#2A3441' : '#E8EBF0'),
                            width: avatarSize,
                            height: avatarSize,
                            borderRadius: avatarSize / 2,
                        },
                    ]}
                >
                    <Text style={[styles.avatarText, { color: cat?.color ? '#FFFFFF' : (scheme === 'dark' ? '#FFFFFF' : '#0B1220'), fontSize: getFontSize(14, 15, 16) }]}>
                        {(cat?.name || title).slice(0, 1).toUpperCase()}
                    </Text>
                </View>
            </View>
            <View style={[styles.left, { paddingRight: getSpacing(10, 11, 12) }]}>
                <Text style={[styles.title, { color: textColor, fontSize: getFontSize(14, 14, 15) }]} numberOfLines={1}>
                    {title}
                </Text>
                <Text style={[styles.sub, { color: Colors[scheme].muted, fontSize: getFontSize(11, 11, 12) }]}>
                    {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {cat?.name ?? tx.category}
                </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.amount, { color: amountColor, fontSize: getFontSize(15, 16, 17) }]}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
                <Text style={[styles.amountLabel, { color: Colors[scheme].muted, fontSize: getFontSize(9, 9, 10) }]}>
                    {tx.type === 'income' ? 'credit' : 'debit'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Tokens.radius.md,
    },
    avatarWrap: {},
    avatar: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { fontWeight: '800' },
    left: { flex: 1 },
    title: { fontWeight: '600', marginBottom: 3 },
    sub: { fontWeight: '500' },
    amount: { fontWeight: '700', fontVariant: ['tabular-nums'], marginBottom: 2 },
    amountLabel: { fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
});
