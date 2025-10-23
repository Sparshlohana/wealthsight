import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useCategories } from '@/contexts/CategoriesContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

function monthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }

export default function StatsScreen() {
    const { transactions } = useTransactions();
    const { categories } = useCategories();
    const [range, setRange] = useState<'month' | 'year' | 'week' | 'all'>('month');
    const textColor = useThemeColor({}, 'text');
    const scheme = useColorScheme() ?? 'light';

    const { pieData, barData, totalIncome, totalExpense, changePct } = useMemo(() => {
        const now = new Date();
        let from: Date | null = null;
        if (range === 'month') from = new Date(now.getFullYear(), now.getMonth(), 1);
        else if (range === 'year') from = new Date(now.getFullYear(), 0, 1);
        else if (range === 'week') { const d = new Date(now); d.setDate(now.getDate() - 7); from = d; }

        const inRange = transactions.filter(t => !from || new Date(t.date) >= from);

        const byCat = new Map<string, number>();
        let totalIncome = 0, totalExpense = 0;
        inRange.forEach(t => {
            if (t.type === 'expense') byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount);
            if (t.type === 'income') totalIncome += t.amount; else totalExpense += t.amount;
        });

        const pieData = Array.from(byCat.entries()).map(([catId, value]) => {
            const cat = categories.find(c => c.id === catId);
            return { value, text: cat?.name ?? catId, color: cat?.color ?? '#90A4AE' };
        });

        const byMonth = new Map<string, { income: number; expense: number }>();
        transactions.forEach(t => {
            const k = monthKey(new Date(t.date));
            const e = byMonth.get(k) ?? { income: 0, expense: 0 };
            if (t.type === 'income') e.income += t.amount; else e.expense += t.amount;
            byMonth.set(k, e);
        });
        const months = Array.from(byMonth.keys()).sort();
        const barData = months.slice(-6).map(k => ({
            label: k.split('-')[1],
            stacks: [
                { value: byMonth.get(k)!.income, color: '#2e7d32' },
                { value: byMonth.get(k)!.expense, color: '#c62828' },
            ],
        }));

        // month-over-month change percentage (total expense)
        const last2 = months.slice(-2);
        let changePct = 0;
        if (last2.length === 2) {
            const prev = byMonth.get(last2[0])!.expense;
            const curr = byMonth.get(last2[1])!.expense;
            if (prev > 0) changePct = ((curr - prev) / prev) * 100;
        }

        return { pieData, barData, totalIncome, totalExpense, changePct };
    }, [transactions, categories, range]);

    // Provide a safe fallback for charts when there's no data to avoid runtime errors
    const safePieData = pieData.length > 0 ? pieData : [{ value: 1, text: 'No data', color: '#9BA1A6' }];
    const hasBars = (barData?.length ?? 0) > 0;

    return (
        <ThemedView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
                    <ThemedText type="title">Insights</ThemedText>
                    <View style={styles.segment}>
                        {(['week', 'month', 'year', 'all'] as const).map((r) => (
                            <TouchableOpacity
                                key={r}
                                onPress={() => setRange(r)}
                                style={[
                                    styles.segBtn,
                                    { borderColor: Colors[scheme].border },
                                    range === r && { backgroundColor: Colors[scheme].tint, borderColor: Colors[scheme].tint },
                                ]}
                            >
                                <Text style={[styles.segText, range === r && { color: 'white' }]}>
                                    {r.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Card>
                        <ThemedText>
                            Income: ₹{totalIncome.toFixed(0)} • Expense: ₹{totalExpense.toFixed(0)} • MoM: {changePct.toFixed(1)}%
                        </ThemedText>
                    </Card>

                    <Card>
                        <ThemedText type="subtitle">Category-wise expenses</ThemedText>
                        <PieChart
                            data={safePieData}
                            donut
                            showText
                            textColor={textColor}
                            radius={110}
                            innerRadius={70}
                            focusOnPress
                        />
                    </Card>

                    <Card>
                        <ThemedText type="subtitle">Income vs Expense (last 6 months)</ThemedText>
                        {hasBars ? (
                            <BarChart stackData={barData as any} barWidth={22} noOfSections={4} isAnimated />
                        ) : (
                            <ThemedText>No monthly data available yet.</ThemedText>
                        )}
                    </Card>
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    segment: { flexDirection: 'row', gap: 8 },
    segBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 },
    segText: { fontWeight: '700' },
});
