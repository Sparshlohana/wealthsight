import TransactionForm from '@/components/transaction-form';
import React from 'react';
import { ScrollView } from 'react-native';

export default function AddScreen() {
    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <TransactionForm />
        </ScrollView>
    );
}
