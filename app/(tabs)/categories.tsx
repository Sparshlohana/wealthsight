import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useCategories } from '@/contexts/CategoriesContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
    const { categories, add, rename, remove, resetDefaults } = useCategories();
    const [newName, setNewName] = useState('');
    const scheme = useColorScheme() ?? 'light';

    function onAdd() {
        const name = newName.trim();
        if (!name) return;
        add(name);
        setNewName('');
    }

    return (
        <ThemedView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
                    <ThemedText type="title">Categories</ThemedText>
                    <Card style={{ gap: 12 }}>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TextInput
                                placeholder="Add new category"
                                placeholderTextColor={Colors[scheme].muted}
                                value={newName}
                                onChangeText={setNewName}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: Colors[scheme].border,
                                    borderRadius: 10,
                                    padding: 10,
                                    backgroundColor: scheme === 'dark' ? '#0F1418' : '#FBFCFD',
                                    color: Colors[scheme].text
                                }}
                            />
                            <AppButton title="Add" onPress={onAdd} />
                        </View>
                    </Card>

                    {categories.map((c) => (
                        <Card key={c.id} style={styles.card}>
                            <View style={[styles.dot, { backgroundColor: c.color ?? '#90A4AE' }]} />
                            <Text style={{ flex: 1, fontWeight: '600', color: Colors[scheme].text }}>{c.name}</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity
                                    onPress={() => rename(c.id, c.name + ' ✓')}
                                    style={[styles.actionBtn, { backgroundColor: scheme === 'dark' ? '#1F2123' : '#eee' }]}
                                >
                                    <Text style={{ color: Colors[scheme].text }}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => remove(c.id)}
                                    style={[styles.actionBtnDanger, { backgroundColor: scheme === 'dark' ? '#3D1F1F' : '#FFEEEE' }]}
                                >
                                    <Text style={{ color: Colors[scheme].danger, fontWeight: '700' }}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </Card>
                    ))}

                    <AppButton title="Reset defaults" onPress={resetDefaults} variant="soft" />
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dot: { width: 12, height: 12, borderRadius: 6 },
    actionBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
    actionBtnDanger: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
});
