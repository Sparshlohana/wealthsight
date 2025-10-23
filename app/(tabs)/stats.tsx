import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useCategories } from '@/contexts/CategoriesContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

function monthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }

export default function StatsScreen() {
    const { transactions } = useTransactions();
    const { categories } = useCategories();
    const [range, setRange] = useState<'month' | 'year' | 'week' | 'all'>('month');
    const textColor = useThemeColor({}, 'text');
    const scheme = useColorScheme() ?? 'light';
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();

    const { pieData, barData, totalIncome, totalExpense } = useMemo(() => {
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

    const balance = totalIncome - totalExpense;

    return (
        <ThemedView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(24, insets.bottom + tabBarHeight + 24) }}
                    scrollIndicatorInsets={{ bottom: tabBarHeight + 24 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText type="title" style={styles.headerTitle}>Insights</ThemedText>
                        <ThemedText style={[styles.headerSubtitle, { color: Colors[scheme].muted }]}>
                            Track your financial journey
                        </ThemedText>
                    </View>

                    {/* Period Selector */}
                    <View style={[styles.segmentContainer, { backgroundColor: Colors[scheme].surface, borderColor: Colors[scheme].border }]}>
                        {(['week', 'month', 'year', 'all'] as const).map((r, index) => (
                            <TouchableOpacity
                                key={r}
                                onPress={() => setRange(r)}
                                style={[
                                    styles.segBtn,
                                    index === 0 && styles.segBtnFirst,
                                    index === 3 && styles.segBtnLast,
                                    range === r && { backgroundColor: Colors[scheme].tint }
                                ]}
                            >
                                <Text style={[
                                    styles.segText,
                                    { color: Colors[scheme].muted },
                                    range === r && styles.segTextActive
                                ]}>
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Balance Card with Gradient */}
                    <LinearGradient
                        colors={scheme === 'dark'
                            ? ['#1a237e', '#0d47a1', '#01579b']
                            : ['#667eea', '#764ba2', '#f093fb']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.balanceCard}
                    >
                        <View style={styles.balanceHeader}>
                            <View>
                                <Text style={styles.balanceLabel}>Net Balance</Text>
                                <Text style={styles.balanceAmount}>₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                            </View>

                        </View>
                        <View style={styles.balanceStats}>
                            <View style={styles.balanceStat}>
                                <View style={[styles.statIcon, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
                                    <Ionicons name="arrow-down-circle" size={20} color="#4CAF50" />
                                </View>
                                <View>
                                    <Text style={styles.statLabel}>Income</Text>
                                    <Text style={styles.statValue}>₹{totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.balanceStat}>
                                <View style={[styles.statIcon, { backgroundColor: 'rgba(244, 67, 54, 0.2)' }]}>
                                    <Ionicons name="arrow-up-circle" size={20} color="#F44336" />
                                </View>
                                <View>
                                    <Text style={styles.statLabel}>Expense</Text>
                                    <Text style={styles.statValue}>₹{totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Category Breakdown */}
                    <Card style={styles.chartCard}>
                        <View style={styles.cardHeader}>
                            <View>
                                <ThemedText type="subtitle" style={styles.cardTitle}>Spending by Category</ThemedText>
                                <ThemedText style={[styles.cardSubtitle, { color: Colors[scheme].muted }]}>
                                    Where your money goes
                                </ThemedText>
                            </View>
                            <View style={[styles.iconBadge, { backgroundColor: Colors[scheme].tint + '15' }]}>
                                <Ionicons name="pie-chart" size={20} color={Colors[scheme].tint} />
                            </View>
                        </View>
                        <View style={styles.chartContainer}>
                            <PieChart
                                data={safePieData}
                                donut
                                showText
                                textColor={textColor}
                                radius={100}
                                innerRadius={60}
                                innerCircleColor={Colors[scheme].surface}
                                focusOnPress
                                textSize={12}
                                textBackgroundRadius={16}
                                showTextBackground
                                textBackgroundColor={scheme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)'}
                            />
                        </View>
                        {pieData.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="analytics-outline" size={48} color={Colors[scheme].muted} />
                                <ThemedText style={{ color: Colors[scheme].muted, marginTop: 12 }}>
                                    No expense data yet
                                </ThemedText>
                            </View>
                        )}
                    </Card>

                    {/* Income vs Expense Chart */}
                    <Card style={styles.chartCard}>
                        <View style={styles.cardHeader}>
                            <View>
                                <ThemedText type="subtitle" style={styles.cardTitle}>Monthly Overview</ThemedText>
                                <ThemedText style={[styles.cardSubtitle, { color: Colors[scheme].muted }]}>
                                    Last 6 months comparison
                                </ThemedText>
                            </View>
                            <View style={[styles.iconBadge, { backgroundColor: Colors[scheme].tint + '15' }]}>
                                <Ionicons name="bar-chart" size={20} color={Colors[scheme].tint} />
                            </View>
                        </View>
                        {hasBars ? (
                            <View style={styles.chartContainer}>
                                <BarChart
                                    stackData={barData as any}
                                    barWidth={28}
                                    spacing={32}
                                    noOfSections={4}
                                    isAnimated
                                    animationDuration={800}
                                    xAxisThickness={0}
                                    yAxisThickness={0}
                                    yAxisTextStyle={{ color: Colors[scheme].muted, fontSize: 10 }}
                                    xAxisLabelTextStyle={{ color: Colors[scheme].muted, fontSize: 11, fontWeight: '600' }}
                                    barBorderRadius={6}
                                    height={180}
                                />
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="stats-chart-outline" size={48} color={Colors[scheme].muted} />
                                <ThemedText style={{ color: Colors[scheme].muted, marginTop: 12 }}>
                                    No monthly data available yet
                                </ThemedText>
                            </View>
                        )}
                    </Card>

                    {/* Legend */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#2e7d32' }]} />
                            <ThemedText style={[styles.legendText, { color: Colors[scheme].muted }]}>Income</ThemedText>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#c62828' }]} />
                            <ThemedText style={[styles.legendText, { color: Colors[scheme].muted }]}>Expense</ThemedText>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '400',
    },
    segmentContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        borderWidth: 1,
    },
    segBtn: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    segBtnFirst: {
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    segBtnLast: {
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    segText: {
        fontSize: 13,
        fontWeight: '600',
    },
    segTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    balanceCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        overflow: 'hidden',
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    balanceLabel: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    balanceAmount: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    changeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    changeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    balanceStats: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    balanceStat: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    chartCard: {
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        fontWeight: '400',
    },
    iconBadge: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 13,
        fontWeight: '500',
    },
});
