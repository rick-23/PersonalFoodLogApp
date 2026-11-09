import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../context/authContext';
import { Button, Field, Input, notify, styles } from '../components/ui';

const RegisterScreen = ({ navigation }) => {
    const { register, login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const handleRegister = async () => {
        setError(null);
        if (password.length < 8) return setError('Password must be at least 8 characters');
        if (password !== confirmPassword) return setError('Passwords do not match');
        setBusy(true);
        try {
            await register(email.trim(), password);
        } catch (err) {
            setError(err.message);
            setBusy(false);
            return;
        }
        try {
            // Sign straight in after creating the account.
            await login(email.trim(), password);
        } catch {
            notify('Account created', 'Please log in.');
            navigation.replace('Login');
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={[styles.screen, { justifyContent: 'center' }]} keyboardShouldPersistTaps="handled">
                <Text style={[styles.title, { textAlign: 'center', marginBottom: 24 }]}>Create account</Text>
                <Field label="Email">
                    <Input
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </Field>
                <Field label="Password">
                    <Input
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </Field>
                <Field label="Confirm password">
                    <Input
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </Field>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Button title={busy ? 'Creating…' : 'Register'} onPress={handleRegister} disabled={busy || !email} accessibilityLabel="register-button" />
                <View style={{ height: 8 }} />
                <Button title="I already have an account" variant="secondary" onPress={() => navigation.navigate('Login')} accessibilityLabel="go-to-login" />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default RegisterScreen;
