import { Colors } from '@/constants/theme';
import { useCategories } from '@/contexts/CategoriesContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Transaction, TransactionType } from '@/types/finance';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { AppButton } from './ui/button';

const initialDateISO = () => new Date().toISOString();

export default function TransactionForm({
    initialTransaction,
    onSave,
    onCancel,
    hideTitle,
}: {
    initialTransaction?: Transaction | null;
    onSave?: (t: Transaction) => void;
    onCancel?: () => void;
    hideTitle?: boolean;
}) {
    const { categories } = useCategories();
    const { add } = useTransactions();
    const scheme = useColorScheme() ?? 'light';

    const [amount, setAmount] = useState('');
    const [type, setType] = useState<TransactionType>('expense');
    const [category, setCategory] = useState(categories[0]?.id ?? 'misc');
    const [date, setDate] = useState(initialDateISO());
    const [description, setDescription] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateObj, setDateObj] = useState(new Date());

    useEffect(() => {
        if (initialTransaction) {
            setAmount(String(initialTransaction.amount));
            setType(initialTransaction.type);
            setCategory(initialTransaction.category ?? categories[0]?.id ?? 'misc');
            setDate(initialTransaction.date ?? initialDateISO());
            const parsedDate = new Date(initialTransaction.date ?? initialDateISO());
            setDateObj(parsedDate);
            setDescription(initialTransaction.description ?? '');
            setPhotoUri(initialTransaction.photoUri ?? null);
        }
    }, [initialTransaction, categories]);

    const categoryOptions = useMemo(() => categories, [categories]);

    async function pickImage() {
        const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
        if (!res.canceled && res.assets.length) {
            setPhotoUri(res.assets[0].uri);
        }
    }

    function handleDateChange(event: any, selectedDate?: Date) {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setDateObj(selectedDate);
            setDate(selectedDate.toISOString());
        }
    }

    function onSubmit() {
        const value = parseFloat(amount);
        if (!value || value <= 0) return;
        const tx: Transaction = {
            id: initialTransaction?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            amount: value,
            type,
            category,
            description: description || undefined,
            date,
            photoUri,
            source: 'manual',
        };
        if (onSave) {
            onSave(tx);
        } else {
            add(tx);
            // reset
            setAmount('');
            setDescription('');
            setPhotoUri(null);
            setDate(initialDateISO());
        }
    }

    return (
        <View style={styles.container}>
            {!hideTitle && (
                <ThemedText type="title" style={{ marginBottom: 8 }}>
                    {initialTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </ThemedText>
            )}

            {/* Amount Input - Prominent */}
            <View style={styles.section}>
                <Text style={[styles.label, { color: Colors[scheme].muted }]}>Amount</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 32, fontWeight: '700', color: Colors[scheme].text }}>₹</Text>
                    <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0"
                        placeholderTextColor={Colors[scheme].muted}
                        keyboardType="decimal-pad"
                        style={[
                            styles.amountInput,
                            { color: Colors[scheme].text }
                        ]}
                    />
                </View>
            </View>

            {/* Type Selector */}
            <View style={styles.section}>
                <Text style={[styles.label, { color: Colors[scheme].muted }]}>Type</Text>
                <View style={styles.segment}>
                    {(['expense', 'income'] as TransactionType[]).map((t) => {
                        const isActive = type === t;
                        const bgColor = isActive
                            ? (t === 'expense' ? Colors[scheme].danger : Colors[scheme].success)
                            : (scheme === 'dark' ? '#1A1D1F' : '#F6F8FA');
                        return (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setType(t)}
                                style={[
                                    styles.segmentBtn,
                                    {
                                        backgroundColor: bgColor,
                                        borderColor: isActive ? bgColor : Colors[scheme].border,
                                    },
                                ]}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    { color: isActive ? '#FFFFFF' : Colors[scheme].text }
                                ]}>
                                    {t === 'expense' ? '💸 Expense' : '💰 Income'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Category */}
            <View style={styles.section}>
                <Text style={[styles.label, { color: Colors[scheme].muted }]}>Category</Text>
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
                                        borderColor: active ? (c.color ?? Colors[scheme].tint) : Colors[scheme].border,
                                        backgroundColor: active
                                            ? (c.color ?? Colors[scheme].tint)
                                            : (scheme === 'dark' ? '#1A1D1F' : '#F6F8FA'),
                                        borderWidth: active ? 2 : 1,
                                    },
                                ]}
                            >
                                <Text style={[
                                    styles.pillText,
                                    { color: active ? '#FFFFFF' : Colors[scheme].text, fontWeight: active ? '700' : '600' }
                                ]}>{c.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
                <Text style={[styles.label, { color: Colors[scheme].muted }]}>Description</Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="e.g., Lunch at cafe"
                    placeholderTextColor={Colors[scheme].muted}
                    style={[
                        styles.input,
                        {
                            borderColor: Colors[scheme].border,
                            backgroundColor: scheme === 'dark' ? '#1A1D1F' : '#FFFFFF',
                            color: Colors[scheme].text
                        },
                    ]}
                />
            </View>

            {/* Date */}
            <View style={styles.section}>
                <Text style={[styles.label, { color: Colors[scheme].muted }]}>Date</Text>
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={[
                        styles.input,
                        {
                            borderColor: Colors[scheme].border,
                            backgroundColor: scheme === 'dark' ? '#1A1D1F' : '#FFFFFF',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        },
                    ]}
                >
                    <Text style={{ color: Colors[scheme].text, fontSize: 15 }}>
                        {format(dateObj, 'PPP')} • {format(dateObj, 'p')}
                    </Text>
                    <Text style={{ fontSize: 18 }}>📅</Text>
                </TouchableOpacity>
            </View>

            {/* Date Picker Modal (Android) or Inline (iOS) */}
            {Platform.OS === 'android' && showDatePicker && (
                <DateTimePicker
                    value={dateObj}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
            {Platform.OS === 'ios' && showDatePicker && (
                <Modal
                    transparent
                    animationType="slide"
                    visible={showDatePicker}
                    onRequestClose={() => setShowDatePicker(false)}
                >
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            justifyContent: 'flex-end',
                        }}
                        activeOpacity={1}
                        onPress={() => setShowDatePicker(false)}
                    >
                        <View style={{ backgroundColor: scheme === 'dark' ? '#1A1D1F' : '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <Text style={{ fontSize: 18, fontWeight: '700', color: Colors[scheme].text }}>Select Date & Time</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text style={{ fontSize: 16, color: Colors[scheme].tint, fontWeight: '600' }}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={dateObj}
                                mode="datetime"
                                display="spinner"
                                onChange={handleDateChange}
                                textColor={Colors[scheme].text}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}

            {/* Receipt */}
            <View style={styles.section}>
                <Text style={[styles.label, { color: Colors[scheme].muted }]}>Receipt</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <AppButton title={photoUri ? "Change Image" : "Pick Image"} onPress={pickImage} variant="soft" />
                    {photoUri && (
                        <Image source={{ uri: photoUri }} style={{ width: 56, height: 56, borderRadius: 12, borderWidth: 1, borderColor: Colors[scheme].border }} />
                    )}
                </View>
            </View>

            {/* Action Buttons */}
            <View style={{ gap: 12, marginTop: 8 }}>
                <AppButton
                    title={initialTransaction ? 'Save Changes' : 'Add Transaction'}
                    onPress={onSubmit}
                />
                {onCancel && (
                    <AppButton
                        title="Cancel"
                        onPress={onCancel}
                        variant="soft"
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 20, padding: 16 },
    section: { gap: 10 },
    label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    amountInput: {
        fontSize: 48,
        fontWeight: '700',
        flex: 1,
        padding: 0,
        textAlignVertical: 'center',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: Platform.select({ ios: 14, default: 12 }),
        fontSize: 15,
    },
    segment: { flexDirection: 'row', gap: 10, flex: 1 },
    segmentBtn: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderRadius: 12,
        alignItems: 'center',
    },
    segmentText: { fontSize: 15, fontWeight: '600' },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    pill: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    pillText: { fontSize: 14, fontWeight: '600' },
    help: { fontSize: 12, marginTop: 4 },
});
