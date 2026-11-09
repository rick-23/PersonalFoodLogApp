import React, { useCallback, useState } from 'react';
import { ImageBackground, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFoodLog } from '../context/foodLogContext';
import { Button, Card, confirm, notify, styles as ui } from '../components/ui';
import { MEAL_TYPES, formatClock } from '../utils/meals';
import { colors } from '../theme';

const TodayScreen = () => {
    const navigation = useNavigation();
    const { meals, loading, error, refresh, deleteMeal, settings } = useFoodLog();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    }, [refresh]);

    const onDelete = async (meal) => {
        if (!(await confirm('Delete meal?', `Remove "${meal.name}" from today?`))) return;
        try {
            await deleteMeal(meal.id);
        } catch (err) {
            notify('Could not delete', err.message);
        }
    };

    const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <ScrollView
            contentContainerStyle={ui.screen}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <ImageBackground source={require('../../images/image1.png')} style={styles.hero} imageStyle={{ borderRadius: 16 }}>
                <View style={styles.heroOverlay}>
                    <Text style={styles.heroDate}>{today}</Text>
                    <Text style={styles.heroTitle}>
                        {meals.length ? `${meals.length} meal${meals.length === 1 ? '' : 's'} logged` : 'Nothing logged yet'}
                    </Text>
                    {totalCalories > 0 && <Text style={styles.heroDate}>{totalCalories} kcal</Text>}
                </View>
            </ImageBackground>

            {!settings?.enabled && (
                <Pressable onPress={() => navigation.navigate('Reminders')} style={styles.banner}>
                    <Text style={styles.bannerText}>🔔 Turn on meal reminders so you never forget to log</Text>
                </Pressable>
            )}

            {error ? (
                <Card>
                    <Text style={ui.error}>{error}</Text>
                    <Button title="Try again" variant="secondary" onPress={refresh} />
                </Card>
            ) : null}

            {loading ? <Text style={ui.muted}>Loading…</Text> : MEAL_TYPES.map(({ key, label, emoji }) => {
                const items = meals.filter((m) => m.mealType === key);
                return (
                    <Card key={key}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{emoji} {label}</Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Add ${label}`}
                                onPress={() => navigation.navigate('AddMeal', { mealType: key })}
                                hitSlop={8}
                            >
                                <Text style={styles.add}>+ Add</Text>
                            </Pressable>
                        </View>
                        {items.length === 0 ? (
                            <Text style={ui.muted}>Not logged yet</Text>
                        ) : items.map((meal) => (
                            <Pressable key={meal.id} onLongPress={() => onDelete(meal)} style={styles.mealRow} accessibilityHint="Long press to delete">
                                {meal.photoUri ? <Image source={{ uri: meal.photoUri }} style={styles.thumb} /> : null}
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.mealName}>{meal.name}</Text>
                                    <Text style={ui.muted}>
                                        {formatClock(new Date(meal.eatenAt))}
                                        {meal.calories != null ? ` · ${meal.calories} kcal` : ''}
                                        {meal.notes ? ` · ${meal.notes}` : ''}
                                    </Text>
                                </View>
                                <Pressable onPress={() => onDelete(meal)} accessibilityLabel={`Delete ${meal.name}`} hitSlop={8}>
                                    <Text style={styles.delete}>✕</Text>
                                </Pressable>
                            </Pressable>
                        ))}
                    </Card>
                );
            })}

            <Button title="+ Log a meal" onPress={() => navigation.navigate('AddMeal')} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    hero: { height: 140, width: '100%', marginBottom: 12, borderRadius: 16, overflow: 'hidden' },
    heroOverlay: { flex: 1, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.35)', padding: 16, justifyContent: 'flex-end' },
    heroDate: { color: '#fff', fontSize: 15 },
    heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
    banner: { backgroundColor: '#fff1dc', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.primary },
    bannerText: { color: colors.primaryDark, fontWeight: '600' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    add: { color: colors.primaryDark, fontWeight: '700', fontSize: 16 },
    mealRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 },
    mealName: { fontSize: 16, color: colors.text, fontWeight: '600' },
    thumb: { width: 44, height: 44, borderRadius: 8 },
    delete: { color: colors.muted, fontSize: 18, paddingHorizontal: 4 },
});

export default TodayScreen;
