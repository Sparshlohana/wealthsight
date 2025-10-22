import { ThemedText } from '@/components/themed-text';
import { useCategories } from '@/contexts/CategoriesContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { exportCSV, exportJSON } from '@/utils/export';
import React from 'react';
import { Button, ScrollView, Switch, View } from 'react-native';

export default function SettingsScreen() {
    const { theme, toggle } = useAppTheme();
    const { transactions } = useTransactions();
    const { categories } = useCategories();

    async function onExportJSON() { await exportJSON(transactions, categories); }
    async function onExportCSV() { await exportCSV(transactions); }

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            <ThemedText type="title">Settings</ThemedText>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <ThemedText>Dark theme</ThemedText>
                <Switch value={theme === 'dark'} onValueChange={toggle} />
            </View>

            <ThemedText type="subtitle">Export</ThemedText>
            <Button title="Export to JSON" onPress={onExportJSON} />
            <Button title="Export transactions CSV" onPress={onExportCSV} />

            <ThemedText type="subtitle">AI suggestion (placeholder)</ThemedText>
            <ThemedText>
                You spent 20% more on food this week than last week. Consider setting a weekly budget.
            </ThemedText>
        </ScrollView>
    );
}
