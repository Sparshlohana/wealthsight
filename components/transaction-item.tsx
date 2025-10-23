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
    const cardBg = scheme === 'dark' ? '#1A1D1F' : '#FFFFFF';
    const borderColor = scheme === 'dark' ? '#2A2D2F' : Colors[scheme].border;
    const title = tx.description || tx.merchant || (tx.type === 'income' ? 'Income' : 'Expense');

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            style={[styles.row, { backgroundColor: cardBg, borderColor, borderWidth: 1 }]}
        >
            <View style={styles.avatarWrap}>
                <View
                    style={[
                        styles.avatar,
                        { backgroundColor: cat?.color ?? (scheme === 'dark' ? '#2A3441' : '#E8EBF0') },
                    ]}
                >
                    <Text style={[styles.avatarText, { color: cat?.color ? '#FFFFFF' : (scheme === 'dark' ? '#FFFFFF' : '#0B1220') }]}>
                        {(cat?.name || title).slice(0, 1).toUpperCase()}
                    </Text>
                </View>
            </View>
            <View style={styles.left}>
                <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                    {title}
                </Text>
                <Text style={[styles.sub, { color: Colors[scheme].muted }]}>
                    {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {cat?.name ?? tx.category}
                </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.amount, { color: amountColor }]}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
                <Text style={[styles.amountLabel, { color: Colors[scheme].muted }]}>
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
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: Tokens.radius.md,
    },
    avatarWrap: { paddingRight: 12 },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { fontSize: 16, fontWeight: '800' },
    left: { flex: 1, paddingRight: 12 },
    title: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
    sub: { fontSize: 12, fontWeight: '500' },
    amount: { fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'], marginBottom: 2 },
    amountLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
});
