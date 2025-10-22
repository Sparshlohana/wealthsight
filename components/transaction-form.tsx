import { useCategories } from '@/contexts/CategoriesContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import type { Transaction, TransactionType } from '@/types/finance';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { Button, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const initialDateISO = () => new Date().toISOString();

export default function TransactionForm() {
    const { categories } = useCategories();
    const { add } = useTransactions();

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
            <View style={styles.row}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    style={styles.input}
                />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.segment}>
                    {(['expense', 'income'] as TransactionType[]).map((t) => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => setType(t)}
                            style={[styles.segmentBtn, type === t && styles.segmentBtnActive]}
                        >
                            <Text style={[styles.segmentText, type === t && styles.segmentTextActive]}>
                                {t.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pills}>
                    {categoryOptions.map((c) => (
                        <TouchableOpacity
                            key={c.id}
                            onPress={() => setCategory(c.id)}
                            style={[styles.pill, category === c.id && { backgroundColor: c.color ?? '#ccc' }]}
                        >
                            <Text style={styles.pillText}>{c.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Date</Text>
                <TextInput value={date} onChangeText={setDate} style={styles.input} />
                <Text style={styles.help}>ISO format, defaults to now</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Description</Text>
                <TextInput value={description} onChangeText={setDescription} style={styles.input} />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Receipt</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Button title="Pick image" onPress={pickImage} />
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={{ width: 48, height: 48, borderRadius: 8 }} />
                    ) : null}
                </View>
            </View>

            <Button title="Add Transaction" onPress={onSubmit} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 16, padding: 16 },
    row: { gap: 6 },
    label: { fontWeight: '600' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: Platform.select({ ios: 12, default: 10 }),
    },
    segment: { flexDirection: 'row', gap: 8 },
    segmentBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 999,
    },
    segmentBtnActive: { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' },
    segmentText: { fontWeight: '600' },
    segmentTextActive: { color: 'white' },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#eee' },
    pillText: { fontSize: 12, fontWeight: '600' },
    help: { fontSize: 12, opacity: 0.6 },
});
