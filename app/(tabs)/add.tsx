import { ThemedView } from '@/components/themed-view';
import TransactionForm from '@/components/transaction-form';
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddScreen() {
    return (
        <ThemedView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    <TransactionForm />
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}
