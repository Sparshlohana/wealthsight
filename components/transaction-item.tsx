import { Colors, Tokens } from '@/constants/theme';
import { useCategories } from '@/contexts/CategoriesContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Transaction } from '@/types/finance';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const TransactionItem: React.FC<{ tx: Transaction; onPress?: () => void; onLongPress?: () => void }> = ({ tx, onPress, onLongPress }) => {
    const textColor = useThemeColor({}, 'text');
    const scheme = useColorScheme() ?? 'light';
    const { categories } = useCategories();
    const cat = categories.find((c) => c.id === tx.category);
    const amountColor = tx.type === 'income' ? Colors[scheme].success : Colors[scheme].danger;
    const cardBg = scheme === 'dark' ? 'rgba(255,255,255,0.04)' : '#F7F8FA';
    const title = tx.description || tx.merchant || (tx.type === 'income' ? 'Income' : 'Expense');

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.8}
            style={[styles.row, { backgroundColor: cardBg }]}
        >
            <View style={styles.avatarWrap}>
                <View
                    style={[
                        styles.avatar,
                        { backgroundColor: cat?.color ?? (scheme === 'dark' ? '#243041' : '#E2E8F0') },
                    ]}
                >
                    <Text style={styles.avatarText}>
                        {(cat?.name || title).slice(0, 1).toUpperCase()}
                    </Text>
                </View>
            </View>
            <View style={styles.left}>
                <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                    {title}
                </Text>
                <Text style={[styles.sub, { color: textColor, opacity: 0.65 }]}>
                    {new Date(tx.date).toLocaleDateString()} • {cat?.name ?? tx.category}
                </Text>
            </View>
            <Text style={[styles.amount, { color: amountColor }]}>
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: Tokens.radius.md,
    },
    avatarWrap: { paddingRight: 10 },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { color: '#0B1220', fontWeight: '800' },
    left: { flex: 1, paddingRight: 12 },
    title: { fontSize: 16, fontWeight: '600' },
    sub: { fontSize: 12 },
    amount: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
