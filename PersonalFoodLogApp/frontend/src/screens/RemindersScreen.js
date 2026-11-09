import React, { useCallback, useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFoodLog } from '../context/foodLogContext';
import { Button, Card, notify, styles as ui } from '../components/ui';
import { MEAL_TYPES, shiftTime } from '../utils/meals';
import { getPermissionStatus, remindersSupported, requestPermission, sendTestReminder } from '../reminders/notifications';
import { colors } from '../theme';

const RemindersScreen = () => {
    const { settings, updateSettings } = useFoodLog();
    const [permission, setPermission] = useState(null);

    const checkPermission = useCallback(() => {
        getPermissionStatus().then(setPermission).catch(() => setPermission('denied'));
    }, []);
    useEffect(checkPermission, [checkPermission]);

    if (!settings) return null;

    if (!remindersSupported) {
        return (
            <View style={ui.screen}>
                <Card><Text>Meal reminders work in the phone app (Android or iPhone), not in the web version.</Text></Card>
            </View>
        );
    }

    const setEnabled = async (enabled) => {
        if (enabled && permission !== 'granted') {
            const status = await requestPermission();
            setPermission(status);
            if (status !== 'granted') {
                notify('Notifications are off', "Allow notifications for this app in your phone's settings to get reminders.");
                return;
            }
        }
        updateSettings({ ...settings, enabled });
    };

    const updateMeal = (key, change) =>
        updateSettings({ ...settings, meals: { ...settings.meals, [key]: { ...settings.meals[key], ...change } } });

    const blocked = permission === 'denied';

    return (
        <ScrollView contentContainerStyle={ui.screen}>
            <Card>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.heading}>Meal reminders</Text>
                        <Text style={ui.muted}>A nudge at each mealtime. Skipped if you&apos;ve already logged that meal today.</Text>
                    </View>
                    <Switch
                        accessibilityLabel="Meal reminders"
                        value={settings.enabled && !blocked}
                        onValueChange={setEnabled}
                        trackColor={{ true: colors.primary }}
                    />
                </View>
                {blocked && (
                    <>
                        <Text style={[ui.error, { marginTop: 8 }]}>Notifications are blocked for this app.</Text>
                        <Button title="Open settings" variant="secondary" onPress={() => Linking.openSettings()} />
                    </>
                )}
            </Card>

            {settings.enabled && !blocked && (
                <>
                    {MEAL_TYPES.map(({ key, label, emoji }) => {
                        const meal = settings.meals[key];
                        return (
                            <Card key={key}>
                                <View style={styles.row}>
                                    <Text style={[styles.heading, { flex: 1 }]}>{emoji} {label}</Text>
                                    <Switch
                                        accessibilityLabel={`${label} reminder`}
                                        value={meal.enabled}
                                        onValueChange={(enabled) => updateMeal(key, { enabled })}
                                        trackColor={{ true: colors.primary }}
                                    />
                                </View>
                                {meal.enabled && (
                                    <View style={styles.stepper}>
                                        <Button title="−15m" variant="secondary" onPress={() => updateMeal(key, { time: shiftTime(meal.time, -15) })} accessibilityLabel={`${label} earlier`} />
                                        <Text style={styles.time} accessibilityLabel={`${label} time`}>{meal.time}</Text>
                                        <Button title="+15m" variant="secondary" onPress={() => updateMeal(key, { time: shiftTime(meal.time, 15) })} accessibilityLabel={`${label} later`} />
                                    </View>
                                )}
                            </Card>
                        );
                    })}
                    <Button
                        title="Send a test reminder"
                        variant="secondary"
                        onPress={async () => {
                            await sendTestReminder();
                            notify('Test scheduled', 'You should get a reminder in about 5 seconds.');
                        }}
                    />
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    heading: { fontSize: 17, fontWeight: '700', color: colors.text },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
    time: { fontSize: 22, fontWeight: '700', minWidth: 70, textAlign: 'center', color: colors.text },
});

export default RemindersScreen;
