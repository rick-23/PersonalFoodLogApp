import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { api } from '../api/client';
import { Button, Field, Input, styles as ui } from '../components/ui';

const NUMBER = /^\d+(\.\d)?$/;
const FIELDS = [
    { name: 'age', label: 'Age', placeholder: 'Enter your age', pattern: /^\d+$/, min: 1, max: 130, message: 'Age must be a whole number (1–130)' },
    { name: 'heightCm', label: 'Height (cm)', placeholder: 'Enter your height', pattern: NUMBER, min: 30, max: 300, message: 'Height must be a number (30–300)' },
    { name: 'weightKg', label: 'Weight (kg)', placeholder: 'Enter your weight', pattern: NUMBER, min: 2, max: 500, message: 'Weight must be a number (2–500)' },
];

const toForm = (profile) => ({
    name: profile?.name ?? '',
    age: profile?.age != null ? String(profile.age) : '',
    heightCm: profile?.heightCm != null ? String(profile.heightCm) : '',
    weightKg: profile?.weightKg != null ? String(profile.weightKg) : '',
});

const PersonalInfoScreen = ({ navigation }) => {
    const [status, setStatus] = useState({ loading: true, saving: false, error: null });
    const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: toForm(null) });

    useEffect(() => {
        api.get('/profile')
            .then(({ profile }) => { reset(toForm(profile)); setStatus((s) => ({ ...s, loading: false })); })
            .catch((err) => setStatus((s) => ({ ...s, loading: false, error: err.message })));
    }, [reset]);

    const onSubmit = async (data) => {
        setStatus((s) => ({ ...s, saving: true, error: null }));
        try {
            await api.put('/profile', {
                name: data.name.trim() || null,
                age: data.age === '' ? null : Number(data.age),
                heightCm: data.heightCm === '' ? null : Number(data.heightCm),
                weightKg: data.weightKg === '' ? null : Number(data.weightKg),
            });
            navigation?.goBack();
        } catch (err) {
            setStatus((s) => ({ ...s, saving: false, error: err.message }));
        }
    };

    if (status.loading) return <Text style={[ui.muted, { padding: 16 }]}>Loading…</Text>;

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={ui.screen} keyboardShouldPersistTaps="handled">
                <Field label="Name" error={errors.name?.message}>
                    <Controller
                        control={control}
                        name="name"
                        rules={{ required: 'Name is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input placeholder="Enter your name" onBlur={onBlur} onChangeText={onChange} value={value} />
                        )}
                    />
                </Field>
                {FIELDS.map(({ name, label, placeholder, pattern, min, max, message }) => (
                    <Field key={name} label={label} error={errors[name]?.message}>
                        <Controller
                            control={control}
                            name={name}
                            rules={{
                                required: `${label.replace(/ \(.*/, '')} is required`,
                                validate: (v) => (pattern.test(v) && Number(v) >= min && Number(v) <= max) || message,
                            }}
                            render={({ field: { onChange, value } }) => (
                                <Input placeholder={placeholder} keyboardType="decimal-pad" onChangeText={onChange} value={value} />
                            )}
                        />
                    </Field>
                ))}
                {status.error ? <Text style={ui.error}>{status.error}</Text> : null}
                <Button title={status.saving ? 'Saving…' : 'Save'} onPress={handleSubmit(onSubmit)} disabled={status.saving} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default PersonalInfoScreen;
