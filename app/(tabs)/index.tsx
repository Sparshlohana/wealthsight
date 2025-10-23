import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionItem } from '@/components/transaction-item';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors, Tokens } from '@/constants/theme';
import { useTransactions } from '@/contexts/TransactionsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { canReadSms, parseTransactionFromMessage, readTransactionsFromDevice } from '@/utils/sms';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { transactions, importMany } = useTransactions();
  const scheme = useColorScheme() ?? 'light';
  const [manualSms, setManualSms] = useState('');
  const insets = useSafeAreaInsets();

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
        <View style={styles.header}>
          <ThemedText type="title">WealthSight</ThemedText>
        </View>

        {/* Fixed summary and import section (non-scrollable) */}
        <View style={{ padding: 16, gap: 16 }}>
          {/* Summary */}
          <Card>
            <ThemedText type="subtitle">Balance</ThemedText>
            <ThemedText style={{ fontSize: 34, fontWeight: '800', marginTop: 2 }}>
              ₹{balance.toFixed(0)}
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
              <Badge
                color={Colors[scheme].success}
                label={`In ₹${incomeTotal.toFixed(0)}`}
              />
              <Badge
                color={Colors[scheme].danger}
                label={`Out ₹${expenseTotal.toFixed(0)}`}
              />
            </View>
          </Card>

          {/* Import section */}
          <Card style={{ gap: 12 }}>
            <ThemedText type="subtitle">Quick import</ThemedText>
            <AppButton title="Import from SMS (Android)" onPress={onImportSms} />
            <View style={{ gap: 8 }}>
              <ThemedText>Paste an SMS to parse</ThemedText>
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
                  borderRadius: Tokens.radius.sm,
                  padding: Platform.select({ ios: 12, default: 10 }),
                  backgroundColor: scheme === 'dark' ? '#0F1418' : '#FBFCFD',
                  color: Colors[scheme].text,
                }}
              />
              <AppButton title="Parse SMS" onPress={onParseManual} variant="soft" />
            </View>
          </Card>

          <ThemedText type="subtitle">Recent transactions</ThemedText>
        </View>

        {/* Only the list scrolls and fills remaining space */}
        <FlatList
          style={{ flex: 1 }}
          data={recent}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 16 }}>
              <TransactionItem tx={item} />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: Math.max(16, insets.bottom + 16), paddingTop: 4, gap: 10 }}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <View
      style={{
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: Tokens.radius.pill,
        backgroundColor: `${color}22`,
      }}
    >
      <ThemedText style={{ color, fontWeight: '700' }}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, gap: 8 },
});
