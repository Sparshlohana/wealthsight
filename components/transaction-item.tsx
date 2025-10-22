import { useThemeColor } from '@/hooks/use-theme-color';
import type { Transaction } from '@/types/finance';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const TransactionItem: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const textColor = useThemeColor({}, 'text');
    const amountColor = tx.type === 'income' ? '#2e7d32' : '#c62828';
    return (
        <View style={styles.row}>
            <View style={styles.left}>
                <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                    {tx.description || tx.merchant || (tx.type === 'income' ? 'Income' : 'Expense')}
                </Text>
                <Text style={[styles.sub, { color: textColor, opacity: 0.6 }]}>
                    {new Date(tx.date).toLocaleDateString()} • {tx.category}
                </Text>
            </View>
            <Text style={[styles.amount, { color: amountColor }]}>
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'transparent',
    },
    left: { flex: 1, paddingRight: 12 },
    title: { fontSize: 16, fontWeight: '600' },
    sub: { fontSize: 12 },
    amount: { fontSize: 16, fontWeight: '700' },
});
