import { Colors } from '@/constants/theme';
import { useCategories } from '@/contexts/CategoriesContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Transaction, TransactionType } from '@/types/finance';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { AppButton } from './ui/button';
import { Card } from './ui/card';

const initialDateISO = () => new Date().toISOString();

export default function TransactionForm() {
    const { categories } = useCategories();
    const { add } = useTransactions();
    const scheme = useColorScheme() ?? 'light';

    const [amount, setAmount] = useState('');
    const [type, setType] = useState<TransactionType>('expense');
    const [category, setCategory] = useState(categories[0]?.id ?? 'misc');
    const [date, setDate] = useState(initialDateISO());
    const [description, setDescription] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    const categoryOptions = useMemo(() => categories, [categories]);

    async function pickImage() {
        const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
        if (!res.canceled && res.assets.length) {
            setPhotoUri(res.assets[0].uri);
        }
    }

    function onSubmit() {
        const value = parseFloat(amount);
        if (!value || value <= 0) return;
        const tx: Transaction = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            amount: value,
            type,
            category,
            description: description || undefined,
            date,
            photoUri,
            source: 'manual',
        };
        add(tx);
        // reset
        setAmount('');
        setDescription('');
        setPhotoUri(null);
        setDate(initialDateISO());
    }

    return (
        <View style={styles.container}>
            <ThemedText type="title">Add Transaction</ThemedText>
            <Card style={{ gap: 16 }}>
                <View style={styles.row}>
                    <Text style={[styles.label, { color: Colors[scheme].text }]}>Amount</Text>
                    <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        placeholderTextColor={Colors[scheme].muted}
                        keyboardType="decimal-pad"
                        style={[
                            styles.input,
                            {
                                borderColor: Colors[scheme].border,
                                backgroundColor: scheme === 'dark' ? '#0F1418' : '#FBFCFD',
                                color: Colors[scheme].text
                            },
                        ]}
                    />
                </View>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: Colors[scheme].text }]}>Type</Text>
                    <View style={styles.segment}>
                        {(['expense', 'income'] as TransactionType[]).map((t) => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setType(t)}
                                style={[
                                    styles.segmentBtn,
                                    { borderColor: Colors[scheme].border },
                                    type === t && { backgroundColor: Colors[scheme].tint, borderColor: Colors[scheme].tint },
                                ]}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    { color: Colors[scheme].text },
                                    type === t && { color: 'white' }
                                ]}>
                                    {t.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: Colors[scheme].text }]}>Category</Text>
                    <View style={styles.pills}>
                        {categoryOptions.map((c) => {
                            const active = category === c.id;
                            return (
                                <TouchableOpacity
                                    key={c.id}
                                    onPress={() => setCategory(c.id)}
                                    style={[
                                        styles.pill,
                                        {
                                            borderColor: Colors[scheme].border,
                                            backgroundColor: scheme === 'dark' ? '#1F2123' : '#eee'
                                        },
                                        active && { backgroundColor: c.color ?? '#ccc', borderColor: c.color ?? '#ccc' },
                                    ]}
                                >
                                    <Text style={[
                                        styles.pillText,
                                        { color: Colors[scheme].text },
                                        active && { color: '#0B1220' }
                                    ]}>{c.name}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: Colors[scheme].text }]}>Date</Text>
                    <TextInput
                        value={date}
                        onChangeText={setDate}
                        placeholderTextColor={Colors[scheme].muted}
                        style={[
                            styles.input,
                            {
                                borderColor: Colors[scheme].border,
                                backgroundColor: scheme === 'dark' ? '#0F1418' : '#FBFCFD',
                                color: Colors[scheme].text
                            },
                        ]}
                    />
                    <Text style={[styles.help, { color: Colors[scheme].muted }]}>ISO format, defaults to now</Text>
                </View>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: Colors[scheme].text }]}>Description</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor={Colors[scheme].muted}
                        style={[
                            styles.input,
                            {
                                borderColor: Colors[scheme].border,
                                backgroundColor: scheme === 'dark' ? '#0F1418' : '#FBFCFD',
                                color: Colors[scheme].text
                            },
                        ]}
                    />
                </View>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: Colors[scheme].text }]}>Receipt</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <AppButton title="Pick image" onPress={pickImage} variant="soft" />
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={{ width: 48, height: 48, borderRadius: 8 }} />
                        ) : null}
                    </View>
                </View>
            </Card>

            <AppButton title="Add Transaction" onPress={onSubmit} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 16, padding: 16 },
    row: { gap: 6 },
    label: { fontWeight: '700' },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: Platform.select({ ios: 12, default: 10 }),
    },
    segment: { flexDirection: 'row', gap: 8 },
    segmentBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderRadius: 999,
    },
    segmentText: { fontWeight: '600' },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 },
    pillText: { fontSize: 12, fontWeight: '600' },
    help: { fontSize: 12 },
});
