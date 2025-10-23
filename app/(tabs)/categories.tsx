import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors, Tokens } from '@/constants/theme';
import { useCategories } from '@/contexts/CategoriesContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import {
    Alert,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORY_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#74B9FF',
    '#55EFC4', '#81ECEC', '#FAB1A0', '#FF7675', '#E17055'
];

export default function CategoriesScreen() {
    const { categories, add, rename, remove, resetDefaults } = useCategories();
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
    const scheme = useColorScheme() ?? 'light';

    function onAdd() {
        const name = newName.trim();
        if (!name) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }
        add(name, selectedColor);
        setNewName('');
        setSelectedColor(CATEGORY_COLORS[0]);
        Keyboard.dismiss();
    }

    function startEditing(id: string, currentName: string) {
        setEditingId(id);
        setEditingName(currentName);
    }

    function saveEdit() {
        const trimmed = editingName.trim();
        if (!trimmed) {
            Alert.alert('Error', 'Category name cannot be empty');
            return;
        }
        if (editingId) {
            rename(editingId, trimmed);
            setEditingId(null);
            setEditingName('');
            Keyboard.dismiss();
        }
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingName('');
        Keyboard.dismiss();
    }

    function confirmDelete(id: string, name: string) {
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete "${name}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => remove(id)
                }
            ]
        );
    }

    function confirmReset() {
        Alert.alert(
            'Reset Categories',
            'This will restore all default categories and remove custom ones. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: resetDefaults
                }
            ]
        );
    }

    return (
        <ThemedView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ padding: Tokens.spacing.lg, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText type="title" style={styles.title}>Categories</ThemedText>
                        <ThemedText style={[styles.subtitle, { color: Colors[scheme].muted }]}>
                            Organize your expenses
                        </ThemedText>
                    </View>

                    {/* Add New Category Card */}
                    <Card style={styles.addCard}>
                        <ThemedText style={styles.cardTitle}>Add New Category</ThemedText>

                        <View style={styles.inputRow}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    placeholder="Category name (e.g., Groceries)"
                                    placeholderTextColor={Colors[scheme].muted}
                                    value={newName}
                                    onChangeText={setNewName}
                                    onSubmitEditing={onAdd}
                                    returnKeyType="done"
                                    style={[
                                        styles.input,
                                        {
                                            borderColor: Colors[scheme].border,
                                            backgroundColor: Colors[scheme].background,
                                            color: Colors[scheme].text
                                        }
                                    ]}
                                />
                            </View>
                        </View>

                        {/* Color Selection */}
                        <View style={styles.colorSection}>
                            <Text style={[styles.colorLabel, { color: Colors[scheme].text }]}>Color</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.colorScroll}
                            >
                                {CATEGORY_COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => setSelectedColor(color)}
                                        style={[
                                            styles.colorOption,
                                            { backgroundColor: color },
                                            selectedColor === color && styles.colorOptionSelected
                                        ]}
                                    >
                                        {selectedColor === color && (
                                            <Text style={styles.colorCheckmark}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <AppButton
                            title="Add Category"
                            onPress={onAdd}
                            style={{ marginTop: 4 }}
                        />
                    </Card>

                    {/* Categories List */}
                    <View style={styles.listHeader}>
                        <ThemedText style={styles.listTitle}>Your Categories</ThemedText>
                        <Text style={[styles.categoryCount, { color: Colors[scheme].muted }]}>
                            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                        </Text>
                    </View>

                    {categories.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <Text style={[styles.emptyText, { color: Colors[scheme].muted }]}>
                                No categories yet. Add your first one above! 🎯
                            </Text>
                        </Card>
                    ) : (
                        categories.map((c) => (
                            <Card key={c.id} style={styles.categoryCard}>
                                {editingId === c.id ? (
                                    // Edit Mode
                                    <View style={styles.editContainer}>
                                        <View style={styles.editInputRow}>
                                            <View style={[styles.colorDot, { backgroundColor: c.color ?? '#90A4AE' }]} />
                                            <TextInput
                                                value={editingName}
                                                onChangeText={setEditingName}
                                                onSubmitEditing={saveEdit}
                                                autoFocus
                                                returnKeyType="done"
                                                style={[
                                                    styles.editInput,
                                                    {
                                                        borderColor: Colors[scheme].tint,
                                                        backgroundColor: Colors[scheme].background,
                                                        color: Colors[scheme].text
                                                    }
                                                ]}
                                            />
                                        </View>
                                        <View style={styles.editActions}>
                                            <TouchableOpacity
                                                onPress={cancelEdit}
                                                style={[styles.editBtn, { backgroundColor: scheme === 'dark' ? '#2A2D2E' : '#F0F0F0' }]}
                                            >
                                                <Text style={[styles.editBtnText, { color: Colors[scheme].muted }]}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={saveEdit}
                                                style={[styles.editBtn, { backgroundColor: Colors[scheme].tint }]}
                                            >
                                                <Text style={[styles.editBtnText, { color: '#FFFFFF' }]}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    // Display Mode
                                    <>
                                        <View style={styles.categoryInfo}>
                                            <View style={[styles.colorDot, { backgroundColor: c.color ?? '#90A4AE' }]} />
                                            <Text style={[styles.categoryName, { color: Colors[scheme].text }]}>
                                                {c.name}
                                            </Text>
                                        </View>
                                        <View style={styles.categoryActions}>
                                            <TouchableOpacity
                                                onPress={() => startEditing(c.id, c.name)}
                                                style={[
                                                    styles.actionBtn,
                                                    {
                                                        backgroundColor: scheme === 'dark' ? '#1F2937' : '#E5E7EB',
                                                        borderColor: scheme === 'dark' ? '#374151' : '#D1D5DB'
                                                    }
                                                ]}
                                            >
                                                <Text style={[styles.actionBtnText, { color: Colors[scheme].tint }]}>✏️ Edit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => confirmDelete(c.id, c.name)}
                                                style={[
                                                    styles.actionBtn,
                                                    {
                                                        backgroundColor: scheme === 'dark' ? '#3D1F1F' : '#FEE2E2',
                                                        borderColor: scheme === 'dark' ? '#5A2626' : '#FECACA'
                                                    }
                                                ]}
                                            >
                                                <Text style={[styles.actionBtnText, { color: Colors[scheme].danger }]}>🗑️ Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </Card>
                        ))
                    )}

                    {/* Reset Button */}
                    <View style={styles.resetContainer}>
                        <AppButton
                            title="Reset to Defaults"
                            onPress={confirmReset}
                            variant="soft"
                        />
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
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    addCard: {
        gap: 16,
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 8,
    },
    inputContainer: {
        flex: 1,
    },
    input: {
        borderWidth: 1.5,
        borderRadius: Tokens.radius.md,
        padding: 14,
        fontSize: 16,
        fontWeight: '500',
    },
    colorSection: {
        gap: 10,
    },
    colorLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    colorScroll: {
        marginHorizontal: -4,
    },
    colorOption: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginHorizontal: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorOptionSelected: {
        borderColor: '#FFFFFF',
        ...Tokens.shadow,
    },
    colorCheckmark: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    categoryCount: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyCard: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        padding: 16,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        ...Tokens.shadow,
    },
    categoryName: {
        fontSize: 17,
        fontWeight: '600',
        flex: 1,
    },
    categoryActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: Tokens.radius.md,
        borderWidth: 1,
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    editContainer: {
        flex: 1,
        gap: 12,
    },
    editInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    editInput: {
        flex: 1,
        borderWidth: 2,
        borderRadius: Tokens.radius.md,
        padding: 12,
        fontSize: 16,
        fontWeight: '600',
    },
    editActions: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'flex-end',
    },
    editBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: Tokens.radius.md,
        minWidth: 80,
        alignItems: 'center',
    },
    editBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
    resetContainer: {
        marginTop: 16,
    },
});
