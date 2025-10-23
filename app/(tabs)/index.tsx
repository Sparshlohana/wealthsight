import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import TransactionForm from '@/components/transaction-form';
import { TransactionItem } from '@/components/transaction-item';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useTransactions } from '@/contexts/TransactionsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Transaction } from '@/types/finance';
import { getFontSize, getSpacing } from '@/utils/responsive';
import { canReadSms, parseTransactionFromMessage, readTransactionsFromDevice } from '@/utils/sms';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { transactions, importMany, update } = useTransactions();
  // Ensure scheme is typed for theme colors
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const modalBg = useThemeColor({}, 'background');
  const [manualSms, setManualSms] = useState('');
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const recent = useMemo(() => transactions.sort((a, b) => +new Date(b.date) - +new Date(a.date)), [transactions]);
  const { incomeTotal, expenseTotal, balance } = useMemo(() => {
    const incomeTotal = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { incomeTotal, expenseTotal, balance: incomeTotal - expenseTotal };
  }, [transactions]);

  async function onImportSms() {
    const res = await canReadSms();
    if (!res.supported) {
      Alert.alert(
        'SMS Import Unavailable',
        `${res.reason}\n\nTip: You can paste an SMS below to parse it.`
      );
      return;
    }

    try {
      Alert.alert('SMS Import', 'Scanning your inbox for recent bank/UPI messages...');
      const txs = await readTransactionsFromDevice(200, { debug: true, sample: 5 });
      if (txs.length > 0) {
        importMany(txs);
        Alert.alert('Imported', `${txs.length} transaction${txs.length > 1 ? 's' : ''} added from SMS.`);
      } else {
        Alert.alert('No transactions found', 'No recognizable bank/UPI messages in recent SMS.');
      }
    } catch (e: any) {
      Alert.alert('Import failed', e?.message ? String(e.message) : 'Could not read SMS.');
    }
  }

  // Dev aid: log parser output as you type
  try {
    const preview = manualSms ? parseTransactionFromMessage(manualSms) : null;
    if (preview) console.log('Parser preview:', preview);
  } catch { }

  function onParseManual() {
    const tx = parseTransactionFromMessage(manualSms);
    if (tx) {
      importMany([tx]);
      setManualSms('');
      Alert.alert('Parsed', 'One transaction was added from the SMS text.');
    } else {
      Alert.alert('No transaction found', 'Please paste a valid bank/UPI message.');
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={{ fontSize: getFontSize(24, 28, 32) }}>WealthSight</ThemedText>
          <ThemedText style={{ color: Colors[scheme].muted, fontSize: getFontSize(12, 13, 14) }}>
            Track your expenses effortlessly
          </ThemedText>
        </View>

        {/* Fixed summary and import section (non-scrollable) */}
        <View style={{ paddingHorizontal: getSpacing(12, 14, 16), gap: getSpacing(14, 16, 20) }}>
          {/* Balance Card with Gradient-like Effect */}
          <Card style={{
            padding: getSpacing(14, 16, 20),
            backgroundColor: scheme === 'dark' ? '#1A1D1F' : Colors[scheme].surface,
            borderWidth: 1,
            borderColor: scheme === 'dark' ? '#2A2D2F' : Colors[scheme].border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: getFontSize(11, 12, 13), fontWeight: '600', color: Colors[scheme].muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Total Balance
                </ThemedText>
                <ThemedText style={{ fontSize: getFontSize(32, 38, 42), fontWeight: '800', marginTop: getSpacing(6, 7, 8), letterSpacing: -1, lineHeight: getFontSize(40, 46, 52) }}>
                  ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </ThemedText>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: getSpacing(8, 10, 12), marginTop: getSpacing(14, 16, 20), paddingTop: getSpacing(12, 14, 16), borderTopWidth: 1, borderColor: scheme === 'dark' ? '#2A2D2F' : Colors[scheme].border }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: getSpacing(6, 7, 8) }}>
                <View style={{
                  width: getSpacing(6, 7, 8),
                  height: getSpacing(6, 7, 8),
                  borderRadius: 4,
                  backgroundColor: Colors[scheme].success
                }} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: getFontSize(9, 10, 11), color: Colors[scheme].muted, fontWeight: '600' }}>INCOME</ThemedText>
                  <ThemedText style={{ fontSize: getFontSize(14, 16, 18), fontWeight: '700', color: Colors[scheme].success, marginTop: 2 }}>
                    ₹{incomeTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </ThemedText>
                </View>
              </View>

              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: getSpacing(6, 7, 8) }}>
                <View style={{
                  width: getSpacing(6, 7, 8),
                  height: getSpacing(6, 7, 8),
                  borderRadius: 4,
                  backgroundColor: Colors[scheme].danger
                }} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: getFontSize(9, 10, 11), color: Colors[scheme].muted, fontWeight: '600' }}>EXPENSES</ThemedText>
                  <ThemedText style={{ fontSize: getFontSize(14, 16, 18), fontWeight: '700', color: Colors[scheme].danger, marginTop: 2 }}>
                    ₹{expenseTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </ThemedText>
                </View>
              </View>
            </View>
          </Card>

          {/* Quick Actions Section - Collapsible */}
          <View style={{ gap: getSpacing(8, 10, 12) }}>
            <ThemedText style={{ fontSize: getFontSize(11, 12, 12), fontWeight: '700', color: Colors[scheme].muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Quick Actions
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: getSpacing(8, 9, 10) }}>
              <View style={{ flex: 1 }}>
                <AppButton title="Import SMS" onPress={onImportSms} />
              </View>
            </View>

            {/* Manual SMS Parse */}
            <View style={{ gap: getSpacing(6, 7, 8), marginTop: 4 }}>
              <ThemedText style={{ fontSize: getFontSize(12, 12, 13), color: Colors[scheme].muted }}>Or paste SMS to parse</ThemedText>
              <TextInput
                placeholder="e.g., INR 250 debited at Swiggy..."
                placeholderTextColor={Colors[scheme].muted}
                value={manualSms}
                onChangeText={setManualSms}
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: Colors[scheme].border,
                  borderRadius: getSpacing(8, 9, 10),
                  padding: Platform.select({ ios: getSpacing(10, 11, 12), default: getSpacing(8, 9, 10) }),
                  backgroundColor: scheme === 'dark' ? '#1A1D1F' : '#FFFFFF',
                  color: Colors[scheme].text,
                  fontSize: getFontSize(13, 13, 14),
                  minHeight: getSpacing(70, 75, 80),
                  textAlignVertical: 'top',
                }}
              />
              <AppButton title="Parse SMS" onPress={onParseManual} variant="soft" />
            </View>
          </View>

          {/* Transactions Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: getSpacing(4, 6, 8) }}>
            <ThemedText style={{ fontSize: getFontSize(16, 17, 18), fontWeight: '700' }}>Recent Transactions</ThemedText>
            <ThemedText style={{ fontSize: getFontSize(12, 12, 13), color: Colors[scheme].muted }}>
              {recent.length} {recent.length === 1 ? 'item' : 'items'}
            </ThemedText>
          </View>
        </View>

        {/* Only the list scrolls and fills remaining space */}
        <FlatList
          style={{ flex: 1, marginTop: getSpacing(12, 14, 16) }}
          data={recent}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: getSpacing(12, 14, 16), marginBottom: getSpacing(6, 7, 8) }}>
              <TransactionItem
                tx={item}
                onPress={() => setEditTx(item)}
              />
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={{ padding: getSpacing(30, 35, 40), alignItems: 'center' }}>
              <ThemedText style={{ fontSize: getFontSize(14, 14, 15), color: Colors[scheme].muted, textAlign: 'center', lineHeight: getFontSize(20, 21, 22) }}>
                No transactions yet.{'\n'}Start tracking your expenses!
              </ThemedText>
            </View>
          )}
          // Ensure last items aren't hidden behind the floating tab bar
          contentContainerStyle={{
            paddingBottom: Math.max(24, insets.bottom + tabBarHeight + 16),
            paddingTop: getSpacing(6, 7, 8),
          }}
          scrollIndicatorInsets={{ bottom: tabBarHeight + 14 }}
          showsVerticalScrollIndicator={false}
        />
        <Modal visible={!!editTx} animationType="slide" onRequestClose={() => setEditTx(null)}>
          <ThemedView style={{ flex: 1, backgroundColor: modalBg }}>
            <SafeAreaView style={{ flex: 1 }}>
              {/* Modal header */}
              <View style={{ padding: getSpacing(12, 14, 16), borderBottomWidth: 1, borderColor: useThemeColor({}, 'border') }}>
                <ThemedText type="title" style={{ fontSize: getFontSize(22, 24, 28) }}>Edit Transaction</ThemedText>
              </View>
              <ScrollView contentContainerStyle={{ padding: getSpacing(12, 14, 16) }}>
                {editTx && (
                  <TransactionForm
                    initialTransaction={editTx}
                    hideTitle
                    onSave={(t: Transaction) => {
                      update(t);
                      setEditTx(null);
                      Alert.alert('Saved', 'Transaction updated');
                    }}
                    onCancel={() => setEditTx(null)}
                  />
                )}
              </ScrollView>
            </SafeAreaView>
          </ThemedView>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: getSpacing(12, 14, 16),
    paddingTop: getSpacing(6, 7, 8),
    paddingBottom: getSpacing(12, 14, 16),
    gap: 4
  },
});
