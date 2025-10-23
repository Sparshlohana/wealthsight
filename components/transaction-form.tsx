import { Colors } from '@/constants/theme';
import { useCategories } from '@/contexts/CategoriesContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Transaction, TransactionType } from '@/types/finance';
import { getFontSize, getSpacing } from '@/utils/responsive';
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
                <ThemedText type="title" style={{ marginBottom: getSpacing(6, 7, 8), fontSize: getFontSize(22, 24, 28) }}>
                    {initialTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </ThemedText>
            )}

            {/* Amount Input - Prominent */}
            <View style={styles.section}>
                <Text style={[styles.label, { color: Colors[scheme].muted, fontSize: getFontSize(11, 12, 13) }]}>Amount</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: getSpacing(6, 7, 8) }}>
                    <Text style={{ fontSize: getFontSize(26, 30, 32), fontWeight: '700', color: Colors[scheme].text }}>₹</Text>
                    <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0"
                        placeholderTextColor={Colors[scheme].muted}
                        keyboardType="decimal-pad"
                        style={[
                            styles.amountInput,
                            { color: Colors[scheme].text, fontSize: getFontSize(38, 44, 48) }
                        ]}
                    />
                </View>
            </View>

            {/* Type Selector */}
            <View style={styles.section}>
                <Text style={[styles.label, { color: Colors[scheme].muted, fontSize: getFontSize(11, 12, 13) }]}>Type</Text>
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
                                        paddingVertical: getSpacing(12, 13, 14),
                                        paddingHorizontal: getSpacing(12, 14, 16),
                                    },
                                ]}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    { color: isActive ? '#FFFFFF' : Colors[scheme].text, fontSize: getFontSize(14, 14, 15) }
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
                <Text style={[styles.label, { color: Colors[scheme].muted, fontSize: getFontSize(11, 12, 13) }]}>Category</Text>
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
                                        paddingVertical: getSpacing(8, 9, 10),
                                        paddingHorizontal: getSpacing(12, 14, 16),
                                    },
                                ]}
                            >
                                <Text style={[
                                    styles.pillText,
                                    { color: active ? '#FFFFFF' : Colors[scheme].text, fontWeight: active ? '700' : '600', fontSize: getFontSize(13, 13, 14) }
                                ]}>{c.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
                <Text style={[styles.label, { color: Colors[scheme].muted, fontSize: getFontSize(11, 12, 13) }]}>Description</Text>
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
                            color: Colors[scheme].text,
                            fontSize: getFontSize(14, 14, 15),
                            padding: Platform.select({ ios: getSpacing(12, 13, 14), default: getSpacing(10, 11, 12) }),
                        },
                    ]}
                />
            </View>

            {/* Date */}
            <View style={styles.section}>
                <Text style={[styles.label, { color: Colors[scheme].muted, fontSize: getFontSize(11, 12, 13) }]}>Date</Text>
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
                            padding: Platform.select({ ios: getSpacing(12, 13, 14), default: getSpacing(10, 11, 12) }),
                        },
                    ]}
                >
                    <Text style={{ color: Colors[scheme].text, fontSize: getFontSize(14, 14, 15) }}>
                        {format(dateObj, 'PPP')} • {format(dateObj, 'p')}
                    </Text>
                    <Text style={{ fontSize: getFontSize(16, 17, 18) }}>📅</Text>
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
                        <View style={{ backgroundColor: scheme === 'dark' ? '#1A1D1F' : '#FFFFFF', borderTopLeftRadius: getSpacing(16, 18, 20), borderTopRightRadius: getSpacing(16, 18, 20), padding: getSpacing(12, 14, 16) }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: getSpacing(12, 14, 16) }}>
                                <Text style={{ fontSize: getFontSize(16, 17, 18), fontWeight: '700', color: Colors[scheme].text }}>Select Date & Time</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text style={{ fontSize: getFontSize(14, 15, 16), color: Colors[scheme].tint, fontWeight: '600' }}>Done</Text>
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
                <Text style={[styles.label, { color: Colors[scheme].muted, fontSize: getFontSize(11, 12, 13) }]}>Receipt</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: getSpacing(10, 11, 12) }}>
                    <AppButton title={photoUri ? "Change Image" : "Pick Image"} onPress={pickImage} variant="soft" />
                    {photoUri && (
                        <Image source={{ uri: photoUri }} style={{ width: getSpacing(48, 52, 56), height: getSpacing(48, 52, 56), borderRadius: getSpacing(10, 11, 12), borderWidth: 1, borderColor: Colors[scheme].border }} />
                    )}
                </View>
            </View>

            {/* Action Buttons */}
            <View style={{ gap: getSpacing(10, 11, 12), marginTop: getSpacing(6, 7, 8) }}>
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
    container: { gap: getSpacing(16, 18, 20), padding: getSpacing(12, 14, 16) },
    section: { gap: getSpacing(8, 9, 10) },
    label: { fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    amountInput: {
        fontWeight: '700',
        flex: 1,
        padding: 0,
        textAlignVertical: 'center',
    },
    input: {
        borderWidth: 1,
        borderRadius: getSpacing(10, 11, 12),
    },
    segment: { flexDirection: 'row', gap: getSpacing(8, 9, 10), flex: 1 },
    segmentBtn: {
        flex: 1,
        borderWidth: 1,
        borderRadius: getSpacing(10, 11, 12),
        alignItems: 'center',
    },
    segmentText: { fontWeight: '600' },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: getSpacing(8, 9, 10) },
    pill: {
        borderRadius: getSpacing(10, 11, 12),
    },
    pillText: { fontWeight: '600' },
    help: { fontSize: getFontSize(11, 11, 12), marginTop: 4 },
});
