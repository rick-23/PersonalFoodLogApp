import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { useFoodLog } from '../context/foodLogContext';
import { Button, Field, Input, notify, styles as ui } from '../components/ui';
import { MEAL_TYPES, defaultMealType, formatClock, shiftTime } from '../utils/meals';
import { colors } from '../theme';

/** Today at the given "HH:MM". */
const todayAt = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
};

const AddMealScreen = ({ navigation, route }) => {
    const { addMeal } = useFoodLog();
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
            mealType: route?.params?.mealType || defaultMealType(),
            time: formatClock(new Date()),
            calories: '',
            notes: '',
            photoUri: null,
        },
    });
    const photoUri = watch('photoUri');

    const pickPhoto = async (useCamera) => {
        const permission = useCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            notify('Permission needed', `Allow ${useCamera ? 'camera' : 'photo'} access in your phone's settings to add a photo.`);
            return;
        }
        const options = { mediaTypes: ['images'], quality: 0.5, allowsEditing: true, aspect: [1, 1] };
        const result = useCamera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
        if (!result.canceled) setValue('photoUri', result.assets[0].uri);
    };

    const onSubmit = async (data) => {
        setSaving(true);
        setSaveError(null);
        try {
            await addMeal({
                name: data.name.trim(),
                mealType: data.mealType,
                eatenAt: todayAt(data.time).toISOString(),
                calories: data.calories === '' ? null : Number(data.calories),
                notes: data.notes.trim() || null,
                photoUri: data.photoUri,
            });
            navigation.goBack();
        } catch (err) {
            setSaveError(err.message);
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={ui.screen} keyboardShouldPersistTaps="handled">
                <Field label="What did you eat?" error={errors.name && 'Name is required.'}>
                    <Controller
                        control={control}
                        name="name"
                        rules={{ validate: (v) => v.trim().length > 0 }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input placeholder="Enter food name" onBlur={onBlur} onChangeText={onChange} value={value} autoFocus={Platform.OS !== 'web'} />
                        )}
                    />
                </Field>

                <Field label="Meal">
                    <Controller
                        control={control}
                        name="mealType"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.chips}>
                                {MEAL_TYPES.map(({ key, label, emoji }) => (
                                    <Pressable
                                        key={key}
                                        accessibilityRole="radio"
                                        accessibilityState={{ selected: value === key }}
                                        accessibilityLabel={label}
                                        onPress={() => onChange(key)}
                                        style={[styles.chip, value === key && styles.chipSelected]}
                                    >
                                        <Text style={[styles.chipText, value === key && styles.chipTextSelected]}>{emoji} {label}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    />
                </Field>

                <Field label="Time">
                    <Controller
                        control={control}
                        name="time"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.stepper}>
                                <Button title="−15m" variant="secondary" onPress={() => onChange(shiftTime(value, -15))} style={styles.stepButton} accessibilityLabel="Earlier" />
                                <Text style={styles.time}>{value}</Text>
                                <Button title="+15m" variant="secondary" onPress={() => onChange(shiftTime(value, 15))} style={styles.stepButton} accessibilityLabel="Later" />
                            </View>
                        )}
                    />
                </Field>

                <Field label="Calories (optional)" error={errors.calories && 'Enter a whole number up to 10000.'}>
                    <Controller
                        control={control}
                        name="calories"
                        rules={{ validate: (v) => v === '' || (/^\d+$/.test(v) && Number(v) <= 10000) }}
                        render={({ field: { onChange, value } }) => (
                            <Input placeholder="e.g. 350" keyboardType="number-pad" onChangeText={onChange} value={value} />
                        )}
                    />
                </Field>

                <Field label="Notes (optional)">
                    <Controller
                        control={control}
                        name="notes"
                        render={({ field: { onChange, value } }) => (
                            <Input placeholder="Portion, how you felt…" onChangeText={onChange} value={value} multiline />
                        )}
                    />
                </Field>

                <Field label="Photo (optional)">
                    {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} accessibilityLabel="Meal photo" /> : null}
                    <View style={styles.row}>
                        {Platform.OS !== 'web' && (
                            <Button title="📷 Take photo" variant="secondary" onPress={() => pickPhoto(true)} style={{ flex: 1 }} />
                        )}
                        <Button title="🖼️ Choose photo" variant="secondary" onPress={() => pickPhoto(false)} style={{ flex: 1 }} />
                    </View>
                    {photoUri ? <Button title="Remove photo" variant="secondary" onPress={() => setValue('photoUri', null)} /> : null}
                </Field>

                {saveError ? <Text style={ui.error}>{saveError}</Text> : null}
                <Button title={saving ? 'Saving…' : 'Save'} onPress={handleSubmit(onSubmit)} disabled={saving} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, backgroundColor: '#fff' },
    chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 15, color: colors.text },
    chipTextSelected: { color: '#fff', fontWeight: '700' },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    stepButton: { paddingHorizontal: 14 },
    time: { fontSize: 22, fontWeight: '700', minWidth: 70, textAlign: 'center', color: colors.text },
    row: { flexDirection: 'row', gap: 8 },
    photo: { width: 120, height: 120, borderRadius: 12, marginBottom: 8 },
});

export default AddMealScreen;
