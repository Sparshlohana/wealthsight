import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useCategories } from '@/contexts/CategoriesContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { exportCSV, exportJSON } from '@/utils/export';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type SettingItemProps = {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
};

function SettingItem({ icon, iconColor, title, subtitle, onPress, rightElement, disabled, loading }: SettingItemProps) {
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || !onPress || loading}
            style={({ pressed }) => [
                styles.settingItem,
                {
                    backgroundColor: pressed && onPress ? (theme === 'dark' ? '#1C2226' : '#F0F0F0') : 'transparent',
                    opacity: disabled ? 0.5 : 1,
                },
            ]}
        >
            <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconColor ? `${iconColor}20` : colors.border }]}>
                    <Ionicons name={icon} size={22} color={iconColor || colors.tint} />
                </View>
                <View style={styles.textContainer}>
                    <ThemedText style={styles.settingTitle}>{title}</ThemedText>
                    {subtitle && <ThemedText style={[styles.settingSubtitle, { color: colors.muted }]}>{subtitle}</ThemedText>}
                </View>
            </View>
            {loading ? (
                <ActivityIndicator size="small" color={colors.tint} />
            ) : (
                rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={colors.muted} />)
            )}
        </Pressable>
    );
}

export default function SettingsScreen() {
    const { theme, toggle } = useAppTheme();
    const { transactions } = useTransactions();
    const { categories } = useCategories();
    const colors = Colors[theme];
    const [exportingJSON, setExportingJSON] = useState(false);
    const [exportingCSV, setExportingCSV] = useState(false);

    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();

    async function onExportJSON() {
        try {
            setExportingJSON(true);
            await exportJSON(transactions, categories);
            Alert.alert('Success', 'Data exported successfully!', [{ text: 'OK' }]);
        } catch (error) {
            Alert.alert('Export Failed', 'Could not export data. Please try again.', [{ text: 'OK' }]);
            console.error('Export JSON error:', error);
        } finally {
            setExportingJSON(false);
        }
    }

    async function onExportCSV() {
        try {
            setExportingCSV(true);
            await exportCSV(transactions);
            Alert.alert('Success', 'Transactions exported successfully!', [{ text: 'OK' }]);
        } catch (error) {
            Alert.alert('Export Failed', 'Could not export transactions. Please try again.', [{ text: 'OK' }]);
            console.error('Export CSV error:', error);
        } finally {
            setExportingCSV(false);
        }
    }

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'Are you sure you want to delete all transactions and categories? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        // Implement clear functionality if needed
                        Alert.alert('Feature Coming Soon', 'This feature will be available in the next update.');
                    },
                },
            ]
        );
    };

    return (
        <ThemedView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ScrollView
                    contentContainerStyle={{
                        padding: 20,
                        paddingBottom: Math.max(24, insets.bottom + tabBarHeight + 24),
                    }}
                    scrollIndicatorInsets={{ bottom: tabBarHeight + 24 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText type="title" style={styles.headerTitle}>Settings</ThemedText>
                        <ThemedText style={[styles.headerSubtitle, { color: colors.muted }]}>
                            Manage your preferences
                        </ThemedText>
                    </View>

                    {/* Appearance Section */}
                    <View style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: colors.muted }]}>APPEARANCE</ThemedText>
                        <Card style={styles.card}>
                            <SettingItem
                                icon={theme === 'dark' ? 'moon' : 'sunny'}
                                iconColor={theme === 'dark' ? '#7FD1FF' : '#F59E0B'}
                                title="Dark Mode"
                                subtitle={theme === 'dark' ? 'Enabled' : 'Disabled'}
                                rightElement={
                                    <Switch
                                        value={theme === 'dark'}
                                        onValueChange={toggle}
                                        trackColor={{ false: colors.border, true: colors.tint }}
                                        thumbColor={Platform.OS === 'android' ? colors.surface : undefined}
                                    />
                                }
                            />
                        </Card>
                    </View>

                    {/* Data Management Section */}
                    <View style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: colors.muted }]}>DATA MANAGEMENT</ThemedText>
                        <Card style={styles.card}>
                            <SettingItem
                                icon="cloud-download-outline"
                                iconColor="#10B981"
                                title="Export All Data"
                                subtitle="Export as JSON file"
                                onPress={onExportJSON}
                                loading={exportingJSON}
                                disabled={transactions.length === 0}
                            />
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <SettingItem
                                icon="document-text-outline"
                                iconColor="#3B82F6"
                                title="Export Transactions"
                                subtitle="Export as CSV file"
                                onPress={onExportCSV}
                                loading={exportingCSV}
                                disabled={transactions.length === 0}
                            />
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <SettingItem
                                icon="trash-outline"
                                iconColor="#EF4444"
                                title="Clear All Data"
                                subtitle="Delete all transactions"
                                onPress={handleClearData}
                            />
                        </Card>
                    </View>

                    {/* Statistics */}
                    <View style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: colors.muted }]}>STATISTICS</ThemedText>
                        <Card style={styles.card}>
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <ThemedText style={styles.statValue}>{transactions.length}</ThemedText>
                                    <ThemedText style={[styles.statLabel, { color: colors.muted }]}>Transactions</ThemedText>
                                </View>
                                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                                <View style={styles.statItem}>
                                    <ThemedText style={styles.statValue}>{categories.length}</ThemedText>
                                    <ThemedText style={[styles.statLabel, { color: colors.muted }]}>Categories</ThemedText>
                                </View>
                            </View>
                        </Card>
                    </View>

                    {/* About Section */}
                    <View style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: colors.muted }]}>ABOUT</ThemedText>
                        <Card style={styles.card}>
                            <SettingItem
                                icon="information-circle-outline"
                                iconColor="#8B5CF6"
                                title="App Version"
                                subtitle="1.0.0"
                            />
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <SettingItem
                                icon="logo-github"
                                iconColor="#6366F1"
                                title="View on GitHub"
                                subtitle="wealthsight by Sparshlohana"
                                onPress={() => {
                                    Alert.alert('GitHub', 'Opening repository...', [{ text: 'OK' }]);
                                }}
                            />
                        </Card>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <ThemedText style={[styles.footerText, { color: colors.muted }]}>
                            Made with ❤️ by Sparsh Lohana
                        </ThemedText>
                        <ThemedText style={[styles.footerText, { color: colors.muted, fontSize: 12, marginTop: 4 }]}>
                            © 2025 WealthSight
                        </ThemedText>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '700',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    card: {
        padding: 0,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        minHeight: 60,
    },
    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 13,
    },
    divider: {
        height: 1,
        marginLeft: 72,
    },
    statsRow: {
        flexDirection: 'row',
        padding: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        marginHorizontal: 16,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
    },
    footer: {
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    footerText: {
        fontSize: 14,
    },
});
