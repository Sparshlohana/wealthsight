import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionItem } from '@/components/transaction-item';
import { useTransactions } from '@/contexts/TransactionsContext';
import { canReadSms, parseTransactionFromMessage } from '@/utils/sms';
import React, { useMemo, useState } from 'react';
import { Alert, Button, FlatList, Platform, StyleSheet, TextInput, View } from 'react-native';

export default function HomeScreen() {
  const { transactions, importMany } = useTransactions();
  const [manualSms, setManualSms] = useState('');

  const recent = useMemo(() => transactions.sort((a, b) => +new Date(b.date) - +new Date(a.date)), [transactions]);

  async function onImportSms() {
    const res = await canReadSms();
    Alert.alert(
      res.supported ? 'SMS Import' : 'SMS Import Unavailable',
      res.supported
        ? 'Attempting to read recent bank/UPI messages...'
        : `${res.reason}\n\nTip: You can paste an SMS below to parse it.`
    );
  }

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
      <View style={styles.header}>
        <ThemedText type="title">WealthSight</ThemedText>
        <ThemedText>Recent transactions</ThemedText>
      </View>
      <FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem tx={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
        ListHeaderComponent={
          <View style={{ padding: 16, gap: 8 }}>
            <Button title="Import from SMS (Android)" onPress={onImportSms} />
            <View style={{ gap: 8 }}>
              <ThemedText>Paste an SMS to parse</ThemedText>
              <TextInput
                placeholder="e.g., INR 250 debited at Swiggy..."
                value={manualSms}
                onChangeText={setManualSms}
                multiline
                numberOfLines={3}
                style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: Platform.select({ ios: 12, default: 10 }) }}
              />
              <Button title="Parse SMS" onPress={onParseManual} />
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, gap: 4 },
});
