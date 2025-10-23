import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCategories } from '@/contexts/CategoriesContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { exportCSV, exportJSON } from '@/utils/export';
import React from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const { theme, toggle } = useAppTheme();
    const { transactions } = useTransactions();
    const { categories } = useCategories();

    async function onExportJSON() { await exportJSON(transactions, categories); }
    async function onExportCSV() { await exportCSV(transactions); }

    return (
        <ThemedView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
                    <ThemedText type="title">Settings</ThemedText>

                    <Card>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <ThemedText>Dark theme</ThemedText>
                            <Switch value={theme === 'dark'} onValueChange={toggle} />
                        </View>
                    </Card>

                    <Card style={{ gap: 12 }}>
                        <ThemedText type="subtitle">Export</ThemedText>
                        <AppButton title="Export to JSON" onPress={onExportJSON} />
                        <AppButton title="Export transactions CSV" onPress={onExportCSV} variant="soft" />
                    </Card>

                    <Card>
                        <ThemedText type="subtitle">AI suggestion (placeholder)</ThemedText>
                        <ThemedText>
                            You spent 20% more on food this week than last week. Consider setting a weekly budget.
                        </ThemedText>
                    </Card>
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}
