import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCategories } from '@/contexts/CategoriesContext';
import React, { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CategoriesScreen() {
    const { categories, add, rename, remove, resetDefaults } = useCategories();
    const [newName, setNewName] = useState('');

    function onAdd() {
        const name = newName.trim();
        if (!name) return;
        add(name);
        setNewName('');
    }

    return (
        <ThemedView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
                <ThemedText type="title">Categories</ThemedText>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput
                        placeholder="Add new category"
                        value={newName}
                        onChangeText={setNewName}
                        style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10 }}
                    />
                    <Button title="Add" onPress={onAdd} />
                </View>

                {categories.map((c) => (
                    <View key={c.id} style={styles.card}>
                        <View style={[styles.dot, { backgroundColor: c.color ?? '#90A4AE' }]} />
                        <Text style={{ flex: 1, fontWeight: '600' }}>{c.name}</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity onPress={() => rename(c.id, c.name + ' ✓')} style={styles.actionBtn}>
                                <Text>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => remove(c.id)} style={styles.actionBtn}>
                                <Text>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <Button title="Reset defaults" onPress={resetDefaults} />
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dot: { width: 12, height: 12, borderRadius: 6 },
    actionBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#eee', borderRadius: 8 },
});
